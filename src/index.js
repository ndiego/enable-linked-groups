/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { addFilter } from '@wordpress/hooks';
import {
	BlockControls,
	__experimentalLinkControl as LinkControl, // eslint-disable-line
} from '@wordpress/block-editor';
import {
	Button,
	ToolbarButton,
	MenuGroup,
	MenuItem,
	Popover,
} from '@wordpress/components';
import { link, linkOff, page, Icon } from '@wordpress/icons';
import { useState } from '@wordpress/element';

/**
 * Add the attributes needed for linked groups.
 *
 * @since 0.1.0
 * @param {Object} settings
 */
function addAttributes( settings ) {
	if ( 'core/group' !== settings.name ) {
		return settings;
	}

	// Add the link attributes.
	const linkAttributes = {
		href: {
			type: 'string',
		},
		linkDestination: {
			type: 'string',
		},
		linkTarget: {
			type: 'string',
		},
	};

	const newSettings = {
		...settings,
		attributes: {
			...settings.attributes,
			...linkAttributes,
		},
	};

	return newSettings;
}

addFilter(
	'blocks.registerBlockType',
	'enable-linked-groups/add-attributes',
	addAttributes
);

/**
 * Filter the BlockEdit object and add linked group inspector controls.
 *
 * @todo Fix the issue where the popover remains open when clicking another block.
 *
 * @since 0.1.0
 * @param {Object} BlockEdit
 */
function addInspectorControls( BlockEdit ) {
	return ( props ) => {
		if ( props.name !== 'core/group' ) {
			return <BlockEdit { ...props } />;
		}

		const [ isEditingURL, setIsEditingURL ] = useState( false );
		const [ popoverAnchor, setPopoverAnchor ] = useState( null );
		const { attributes, setAttributes } = props;
		const { href, linkDestination, linkTarget } = attributes;

		return (
			<>
				<BlockEdit { ...props } />
				<BlockControls group="block">
					<ToolbarButton
						ref={ setPopoverAnchor }
						name="link"
						icon={ link }
						title={ __( 'Link', 'enable-linked-groups' ) }
						onClick={ () => setIsEditingURL( true ) }
						isActive={
							!! href ||
							linkDestination === 'post' ||
							isEditingURL
						}
					/>
					{ isEditingURL && (
						<Popover
							anchor={ popoverAnchor }
							onClose={ () => setIsEditingURL( false ) }
							placement="bottom"
							focusOnMount={ true }
							offset={ 12 }
							className="enable-linked-groups__link-popover"
							variant="alternate"
						>
							{ linkDestination !== 'post' && (
								<LinkControl
									value={ {
										url: href,
										opensInNewTab: linkTarget === '_blank',
									} }
									onChange={ ( {
										url: newURL = '',
										opensInNewTab,
									} ) => {
										setAttributes( {
											href: newURL,
											linkDestination: newURL
												? 'custom'
												: undefined,
											linkTarget: opensInNewTab
												? '_blank'
												: undefined,
										} );
									} }
									onRemove={ () =>
										setAttributes( {
											href: undefined,
											linkDestination: undefined,
											linkTarget: undefined,
										} )
									}
								/>
							) }
							{ ! href && ! linkDestination && (
								<div className="enable-linked-groups__link-popover-menu">
									<MenuGroup>
										<MenuItem
											icon={ page }
											iconPosition="left"
											info={ __(
												'Use when the Group is located in a Query block.',
												'enable-linked-groups'
											) }
											onClick={ () =>
												setAttributes( {
													linkDestination: 'post',
												} )
											}
										>
											{ __(
												'Link to current post',
												'enable-linked-groups'
											) }
										</MenuItem>
									</MenuGroup>
								</div>
							) }
							{ linkDestination === 'post' && (
								<div className="enable-linked-groups__link-popover-post-selected">
									<div className="enable-linked-groups__link-popover-post-selected-label">
										<span className="enable-linked-groups__link-popover-post-selected-icon">
											<Icon icon={ page } />
										</span>
										{ __(
											'Linked to current post',
											'enable-linked-groups'
										) }
									</div>
									<Button
										icon={ linkOff }
										label={ __(
											'Remove link',
											'enable-linked-groups'
										) }
										onClick={ () =>
											setAttributes( {
												linkDestination: undefined,
											} )
										}
									/>
								</div>
							) }
						</Popover>
					) }
				</BlockControls>
			</>
		);
	};
}

addFilter(
	'editor.BlockEdit',
	'enable-linked-groups/add-inspector-controls',
	addInspectorControls
);

/**
 * Add linked group classes in the Editor.
 *
 * @since 0.1.0
 * @param {Object} BlockListBlock
 */
function addClasses( BlockListBlock ) {
	return ( props ) => {
		const { name, attributes } = props;

		if ( 'core/group' !== name ) {
			return <BlockListBlock { ...props } />;
		}

		const classes = classnames( props?.className, {
			'is-linked':
				attributes?.href || attributes?.linkDestination === 'post',
		} );

		return <BlockListBlock { ...props } className={ classes } />;
	};
}

addFilter(
	'editor.BlockListBlock',
	'enable-linked-groups/add-classes',
	addClasses
);
