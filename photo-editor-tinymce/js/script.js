(function() {
    document.onreadystatechange = function() {
        if (document.readyState === 'complete') {
            tinymce.init({
                selector:'#tiny',
                plugins: 'image code ximage media',
                toolbar: [
                    'undo redo | styleselect | bold italic | link image | alignleft aligncenter alignright | media',
                    'ximage'
                ]
            });
        }
    }
})();