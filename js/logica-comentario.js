


document.getElementById('newsCommentForm').addEventListener('submit', function(e) {
    e.preventDefault(); 

    
    const nameInput = document.getElementById('userName');
    const commentInput = document.getElementById('userComment');
    const commentsList = document.getElementById('comments-list');

    
    const nameText = nameInput.value;
    const commentText = commentInput.value;

    
    const now = new Date();
    const dateString = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    
    const newComment = document.createElement('div');
    newComment.classList.add('comment-card');
    
    
    newComment.innerHTML = `
        <div class="comment-header">
            <span class="comment-author">${nameText}</span>
            <span class="comment-date">${dateString}</span>
        </div>
        <div class="comment-body">
            ${commentText}
        </div>
    `;

    
    commentsList.prepend(newComment);

    nameInput.value = '';
    commentInput.value = '';
});