// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any jQuery/helper plugins in here.

/*!
 * jQuery TextChange Plugin
 * http://www.zurb.com/playground/jquery-text-change-custom-event
 *
 * Copyright 2010, ZURB
 * Released under the MIT License
 */
 (function(a){a.event.special.textchange={setup:function(){a(this).data("lastValue",this.contentEditable==="true"?a(this).html():a(this).val());a(this).bind("keyup.textchange",a.event.special.textchange.handler);a(this).bind("cut.textchange paste.textchange input.textchange",a.event.special.textchange.delayedHandler)},teardown:function(){a(this).unbind(".textchange")},handler:function(){a.event.special.textchange.triggerIfChanged(a(this))},delayedHandler:function(){var c=a(this);setTimeout(function(){a.event.special.textchange.triggerIfChanged(c)},
 25)},triggerIfChanged:function(a){var b=a[0].contentEditable==="true"?a.html():a.val();b!==a.data("lastValue")&&(a.trigger("textchange",[a.data("lastValue")]),a.data("lastValue",b))}};a.event.special.hastext={setup:function(){a(this).bind("textchange",a.event.special.hastext.handler)},teardown:function(){a(this).unbind("textchange",a.event.special.hastext.handler)},handler:function(c,b){b===""&&b!==a(this).val()&&a(this).trigger("hastext")}};a.event.special.notext={setup:function(){a(this).bind("textchange",
 a.event.special.notext.handler)},teardown:function(){a(this).unbind("textchange",a.event.special.notext.handler)},handler:function(c,b){a(this).val()===""&&a(this).val()!==b&&a(this).trigger("notext")}}})(jQuery);

/*!
 * jQuery cssHooks for Border Radius
 * http://api.jquery.com/jQuery.cssHooks/
 *
 * Copyright 2013, The jQuery Foundation
 * Released under the MIT License
 */
(function( $ ) {
    if ( !$.cssHooks ) {
        throw( new Error( "jQuery 1.4.3+ is needed for this plugin to work" ) );
    }
    function styleSupport( prop ) {
        var vendorProp, supportedProp,
        capProp = prop.charAt( 0 ).toUpperCase() + prop.slice( 1 ),
        prefixes = [ "Moz", "Webkit", "O", "ms" ],
        div = document.createElement( "div" );
        if ( prop in div.style ) {
            supportedProp = prop;
        } else {
            for ( var i = 0; i < prefixes.length; i++ ) {
                vendorProp = prefixes[ i ] + capProp;
                if ( vendorProp in div.style ) {
                    supportedProp = vendorProp;
                    break;
                }
            }
        }
        div = null;
        $.support[ prop ] = supportedProp;
        return supportedProp;
    }
    var borderRadius = styleSupport( "borderRadius" );
    // Set cssHooks only for browsers that support a vendor-prefixed border radius
    if ( borderRadius && borderRadius !== "borderRadius" ) {
        $.cssHooks.borderRadius = {
            get: function( elem, computed, extra ) {
                return $.css( elem, borderRadius );
            },
            set: function( elem, value) {
                elem.style[ borderRadius ] = value;
            }
        };
    }
})( jQuery );
