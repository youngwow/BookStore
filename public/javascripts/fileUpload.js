// import * as FilePond from 'filepond';
// // const FilePond = require('filepond')
// // const FilePondPluginImagePreview = require('filepond-plugin-image-preview');
// // const FilePondPluginImageResize = require('filepond-plugin-image-resize');
// // const FilePondPluginFileEncode = require('filepond-plugin-file-encode');
// import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
// import FilePondPluginImageResize from 'filepond-plugin-image-resize';
// import FilePondPluginFileEncode from 'filepond-plugin-file-encode';
// // import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

const rootStyles = window.getComputedStyle(
    document.documentElement
)
if (rootStyles.getPropertyValue('--book-cover-width-large') != null &&
    rootStyles.getPropertyValue('--book-cover-width-large') !== ''){
    console.log('ready()')
    ready();
} else{
    console.log('listen')
    document.getElementById('main-css')
        .addEventListener('load', ready);
}

function ready() {
    const coverWidth = parseFloat(rootStyles.getPropertyValue('--book-cover-width-large'));
    const coverAspectRatio = parseFloat(
        rootStyles.getPropertyValue('--book-cover-aspect-ratio'));
    const coverHeight = parseFloat(coverWidth / coverAspectRatio);
    console.log("Working!")
    FilePond.registerPlugin(
        FilePondPluginImagePreview,
        FilePondPluginImageResize,
        FilePondPluginFileEncode
    );

    FilePond.setOptions({
        stylePanelAspectRatio: 1 / coverAspectRatio,
        imageResizeTargetWidth: coverWidth,
        imageResizeTargetHeight: coverHeight
    });

    FilePond.parse(document.body);
}

