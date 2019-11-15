export default {
    modules: [
        'Toolbar'
    ],
    overlayStyles: {
        position: 'absolute',
        boxSizing: 'border-box',
    },
    toolbarStyles: {
        position: 'absolute',
        bottom: '10px',
        right: '0',
        left: '0',
        height: '0',
        minWidth: '100px',
        font: '12px/1.0 Arial, Helvetica, sans-serif',
        textAlign: 'center',
        color: '#333',
        boxSizing: 'border-box',
        cursor: 'default',
    },
    toolbarButtonStyles: {
        display: 'inline-block',
        width: '24px',
        height: '24px',
        background: 'white',
        border: '1px solid #999',
        verticalAlign: 'middle',
    },
    toolbarButtonSvgStyles: {
        fill: '#444',
        stroke: '#444',
        strokeWidth: '2',
    },
};
