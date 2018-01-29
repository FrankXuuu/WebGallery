(function() {
	"use strict";

	var currArrayIndex = -1; // current image Id
	var currIds = []; // array of curr img id and comment page

	window.onload = function() {
		// add image toggle
		var addBtn = document.getElementById("add_btn");
		var addForm = document.getElementById("add_form");
		addForm.style.display = "none";
		addBtn.addEventListener("click", function() {
			// form show and hide
			if (addForm.style.display === "none") {
		        addForm.style.display = "grid";
		        addBtn.style.background = "#000000";
		    } else {
		        addForm.style.display = "none";
		        addBtn.style.background = "#33ccff";
		    }
		});

		// post comment toggle
		var formTitle = document.getElementById("form_title");
		var commentForm = document.getElementById("comment_form");
		commentForm.style.display = "none";
		formTitle.addEventListener("click", function() {
			// form show and hide
			if (commentForm.style.display === "none") {
		        commentForm.style.display = "flex";
		        formTitle.style.background = "#000000";
		    } else {
		        commentForm.style.display = "none";
		        formTitle.style.background = "#33ccff";
		    }
		});

		// hide gallery and comments initially (no images)
		var imageIds = api.getAllImageIds();
		for (var i = 0; i < imageIds.length; i++) {
			currIds.push({id: imageIds[i],
						page: 1});
		}
		if (currIds.length == 0) {
			document.getElementById("gallery_container").style.display="none";
		} else {
			currArrayIndex = 0;
			setImage(api.getImage(currIds[currArrayIndex].id));
			setComments(api.getComments(currIds[currArrayIndex].id, api.numComments(currIds[currArrayIndex].id)-10));
			console.log(api.numComments(currIds[currArrayIndex].id));
		}
		// Image adder listener
		addForm.addEventListener("submit", function(e) {
			if (currArrayIndex == -1) {
				document.getElementById("gallery_container").style.display="block";
			}
			// prevent from refreshing the page on submit
            e.preventDefault();
            // read form elements
            var imageAuthor = document.getElementById("image_author").value;
            var imageTitle = document.getElementById("image_title").value;
            var imageUrl = document.getElementById("image_url").value;
            addForm.reset();
            
            var currImage = api.addImage(imageTitle, imageAuthor, imageUrl);
            currIds.push({id: currImage.imageId,
            			page: 1});
            currArrayIndex = currIds.length-1;
            console.log(currIds, currArrayIndex);
            // display the added image
            setImage(currImage);
            setComments([]);
		});


		// comment adder listener
		commentForm.addEventListener("submit", function(e) {
			// prevent from refreshing the page on submit
            e.preventDefault();
            // read form elements
            var username = document.getElementById("comment_user").value;
            var content = document.getElementById("comment_content").value;
            commentForm.reset();

            var currImageId = currIds[currArrayIndex].id;
            var newComment = api.addComment(currImageId, username, content);
            console.log(newComment);

			// create a new comment element
			addNewComment(newComment);

			if (currIds[currArrayIndex].page > 1 || api.numComments(currIds[currArrayIndex].id) > 10) {
				// go back to first page
				setComments(api.getComments(currImageId, api.numComments(currIds[currArrayIndex].id)-10));
				currIds[currArrayIndex].page = 1;
			}
		});

		// Next comments and Prev comments buttons
		setCommentsListeners();
	}

	function setImage(newImage) {
		// display image
		var gallery = document.getElementById("gallery");
        gallery.innerHTML = `<div class="image_container">
        	<img src="${newImage.url}"/></div>
		<div id="under_photo">
			<button id="prev_image" class="small_btn"><</button>
			<div id="caption">
				<div id="title">${newImage.title}</div>
				<div id="author">${newImage.author}</div>
			</div>
			<button id="next_image" class="small_btn">></button>
		</div>
		<button class="small_btn" id="delete_btn">Delete</button>`;
		setImageListeners();
	}

	function setComments(comments) {
		// display comments
		if (comments.length == 0) {
			document.getElementById("comments").innerHTML = `<div class="no_comments">There are no comments at the moment.</div>`;
		} else {
			document.getElementById("comments").innerHTML = ``;
		}
		for (var i = 0; i < comments.length; i++) {
			// create a new comment element
            addNewComment(comments[i]);
		}
	}

	function addNewComment(comment) {
		if (api.numComments(currIds[currArrayIndex].id) == 1) {
			document.getElementById("comments").innerHTML = ``;
		}
		var e = document.createElement('div');
        e.className = "comment";
        e.id = comment.imageId+"comment"+comment.commentId;
        e.innerHTML=`
            <div class="msg_icon"></div>
			<div class="comment_user">${comment.author}
			<span class="date">posted on ${comment.date}</span></div>
			<div class="delete_comment"></div>
			<div class="comment_content">${comment.content}</div>`;
        // add this element to the document
        document.getElementById("comments").prepend(e);
        console.log(comment, comment.imageId, comment.commentId);
        setCommentListeners(comment.imageId, comment.commentId);
	}

	// Set all comment listeners (delete)
	function setCommentListeners(img, com) {
		console.log(img, com);
		var deletes = document.getElementsByClassName("delete_comment");
        deletes[0].addEventListener('click', function() {
            var rmv = document.getElementById(img+"comment"+com);
            rmv.parentNode.removeChild(rmv);
            api.deleteComment(img+"comment"+com);
            // get offset before comment deletion
            var currOffset = api.numComments(currIds[currArrayIndex].id) - currIds[currArrayIndex].page*10;
            console.log("DEL", currOffset);
            // see if there are no comments
            if (api.numComments(currIds[currArrayIndex].id) == 0) {
            	document.getElementById("comments").innerHTML = `<div class="no_comments">There are no comments at the moment.</div>`;
            }
            // move comments from next page back if necessary
            if (currOffset >= 0) {
            	setComments(api.getComments(currIds[currArrayIndex].id, currOffset));
            }
        });
	}

	function setCommentsListeners() {
		document.getElementById("next_comments").addEventListener("click", function(){
			var currOffset = api.numComments(currIds[currArrayIndex].id) - currIds[currArrayIndex].page*10;
			console.log("NEXT", currOffset);
			if (currOffset > 0) {
				setComments(api.getComments(currIds[currArrayIndex].id, currOffset - 10));
				currIds[currArrayIndex].page++;
			}
		});

		document.getElementById("prev_comments").addEventListener("click", function(){
			var currOffset = api.numComments(currIds[currArrayIndex].id) - currIds[currArrayIndex].page*10;
			console.log("PREV", currOffset);
			if (currOffset + 10 < api.numComments(currIds[currArrayIndex].id)) {
				setComments(api.getComments(currIds[currArrayIndex].id, currOffset + 10));
				currIds[currArrayIndex].page--;
			}
		});
	}

	// Set all image listeners (prev, next, delete)
	function setImageListeners() {
		// Image Scrollers listeners
		document.getElementById("next_image").addEventListener("click", function(e){
			if (currArrayIndex < currIds.length-1) {
				currArrayIndex++;
			} else {
				currArrayIndex = 0;
			}
			setImage(api.getImage(currIds[currArrayIndex].id));
			setComments(api.getComments(currIds[currArrayIndex].id, api.numComments(currIds[currArrayIndex].id)-10));
		});

		document.getElementById("prev_image").addEventListener("click", function(e){
			if (currArrayIndex > 0) {
				currArrayIndex--;
			} else {
				currArrayIndex = currIds.length-1;
			}
			setImage(api.getImage(currIds[currArrayIndex].id));
			setComments(api.getComments(currIds[currArrayIndex].id, api.numComments(currIds[currArrayIndex].id)-10));
		});

		// delete button listener
		document.getElementById("delete_btn").addEventListener("click", function(){
			api.deleteImage(currIds[currArrayIndex].id);
			if (currIds.length == 1) {
				currIds.splice(currArrayIndex, 1);
				currArrayIndex = -1;
				document.getElementById("gallery_container").style.display="none";
			} else if (currArrayIndex == currIds.length-1) {
				currIds.splice(currArrayIndex, 1);
				currArrayIndex = 0;
				setImage(api.getImage(currIds[currArrayIndex].id));
				setComments(api.getComments(currIds[currArrayIndex].id, api.numComments(currIds[currArrayIndex].id)-10));
			} else {
				currIds.splice(currArrayIndex, 1);
				setImage(api.getImage(currIds[currArrayIndex].id));
				setComments(api.getComments(currIds[currArrayIndex].id, api.numComments(currIds[currArrayIndex].id)-10));
			}
		});
	}

}());