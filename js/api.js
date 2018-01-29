var api = (function(){
    var module = {};
    
    /*  ******* Data types *******
        image objects must have at least the following attributes:
            - (String) imageId 
            - (String) title
            - (String) author
            - (String) url
            - (Date) date
    
        comment objects must have the following attributes
            - (String) commentId
            - (String) imageId
            - (String) author
            - (String) content
            - (Date) date
    
    ****************************** */

    if (!localStorage.getItem('gallery')){
        localStorage.setItem('gallery', JSON.stringify({imageId: 0, images: []}));
    }
    
    // add an image to the gallery
    // return an image object
    module.addImage = function(title, author, url){
        // create a new image object
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var newImage = {imageId: gallery.imageId++,
                        title: title,
                        author: author,
                        url: url,
                        date: Date()};
        // save it in local storage
        gallery.images.push({image: newImage, 
                            comments: [],
                            commentId: 0});
        localStorage.setItem('gallery', JSON.stringify(gallery));
        return newImage;
    }
    
    // delete an image from the gallery given its imageId
    // return an image object
    module.deleteImage = function(imageId){
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var index = gallery.images.findIndex(function(item){
            return item.image.imageId == imageId;
        });
        if (index == -1) return null;
        var delImage = gallery.images[index].image;
        gallery.images.splice(index, 1);
        localStorage.setItem('gallery', JSON.stringify(gallery));
        return delImage;
    }
    
    // get an image from the gallery given its imageId
    // return an image object
    module.getImage = function(imageId){
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var index = gallery.images.findIndex(function(item){
            return item.image.imageId == imageId;
        });
        if (index == -1) return null;
        return gallery.images[index].image;
    }
    
    // get all imageIds from the gallery
    // return an array of (String) imageId
    module.getAllImageIds = function(){
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var imageIds = []
        for (var i = 0; i < gallery.images.length; i++) {
            imageIds.push(gallery.images[i].image.imageId);
        }
        return imageIds;
    }
    
    // add a comment to an image
    // return a comment object
    module.addComment = function(imageId, author, content){
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var index = gallery.images.findIndex(function(item){
            return item.image.imageId == imageId;
        });
        var newComment = {commentId: gallery.images[index].commentId++,
                        imageId: imageId,
                        author: author,
                        content: content,
                        date: Date()};
        gallery.images[index].comments.push(newComment);
        localStorage.setItem('gallery', JSON.stringify(gallery));
        return newComment;
    }

    // delete a comment to an image
    // return a comment object
    module.deleteComment = function(commentId){
        // imageId and real commentId
        var ids = commentId.split("comment");
        var imageId = ids[0];
        var imageCommentId = ids[1];
        console.log(imageId, imageCommentId);
        // find index of image
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var index = gallery.images.findIndex(function(item){
            return item.image.imageId == imageId;
        });
        if (index == -1) return null;
        // find index of comment and delete it
        console.log(index, gallery.images[index].comments);
        var delIndex = gallery.images[index].comments.findIndex(function(comment){
            return comment.commentId == imageCommentId;
        });
        console.log(delIndex);
        var delComment = gallery.images[index].comments[delIndex];
        gallery.images[index].comments.splice(delIndex, 1);
        localStorage.setItem('gallery', JSON.stringify(gallery));
        console.log(delComment);
        return delComment;
    }
    
    // get 10 latest comments given an offset 
    // return an array of comment objects
    module.getComments = function(imageId, offset=0){
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var index = gallery.images.findIndex(function(item){
            return item.image.imageId == imageId;
        });
        if (index == -1) return null;
        var comments = gallery.images[index].comments;
        if (offset < 0) { 
            return comments.slice(0, offset+10);
        } else {
            return comments.slice(offset, offset+10);
        }
    }

    // get number of comments given an imageId
    module.numComments = function(imageId){
        var gallery = JSON.parse(localStorage.getItem('gallery'));
        var index = gallery.images.findIndex(function(item){
            return item.image.imageId == imageId;
        });
        if (index == -1) return null;
        return gallery.images[index].comments.length;
    }
    
    return module;
})();