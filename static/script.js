document.addEventListener('DOMContentLoaded', () => {
    // Dark mode toggle
    const themeToggle = document.getElementById('theme-toggle');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark');
        sunIcon.classList.add('hidden');
        moonIcon.classList.remove('hidden');
    }

    themeToggle.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark');
        if (document.documentElement.classList.contains('dark')) {
            localStorage.setItem('theme', 'dark');
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        } else {
            localStorage.setItem('theme', 'light');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
    });

    // Toast notification function
    const showToast = (message, type) => {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.remove('hidden', 'success', 'error');
        toast.classList.add(type);
        setTimeout(() => toast.classList.add('hidden'), 3000);
    };

    // Update posts list
    const updatePosts = async () => {
        try {
            const response = await fetch('/');
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newPostsList = doc.getElementById('posts-list');
            postsList.innerHTML = newPostsList.innerHTML;
            attachPostEventListeners(); // Re-attach event listeners
        } catch (error) {
            showToast('Error updating posts: ' + error.message, 'error');
        }
    };

    // Attach event listeners to post buttons
    const attachPostEventListeners = () => {
        document.querySelectorAll('.delete-post').forEach(button => {
            button.addEventListener('click', async () => {
                const index = button.dataset.index;
                try {
                    const response = await fetch(`/delete_post/${index}`, { method: 'POST' });
                    if (response.ok) {
                        showToast('Post deleted successfully', 'success');
                        updatePosts();
                    } else {
                        showToast('Error deleting post', 'error');
                    }
                } catch (error) {
                    showToast('Error: ' + error.message, 'error');
                }
            });
        });

        document.querySelectorAll('.edit-post').forEach(button => {
            button.addEventListener('click', () => {
                const index = button.dataset.index;
                const post = postsList.querySelectorAll('.post-card')[index];
                const title = post.querySelector('h3').textContent;
                const content = post.querySelector('p').textContent;
                document.getElementById('edit-index').value = index;
                document.getElementById('edit-title').value = title;
                document.getElementById('edit-content').value = content;
                document.getElementById('edit-modal').classList.remove('hidden');
            });
        });
    };

    // Post form submission
    const form = document.getElementById('post-form');
    const titleInput = document.getElementById('title');
    const contentInput = document.getElementById('content');
    const titleError = document.getElementById('title-error');
    const contentError = document.getElementById('content-error');
    const postsList = document.getElementById('posts-list');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        titleError.classList.add('hidden');
        contentError.classList.add('hidden');

        const title = titleInput.value.trim();
        const content = contentInput.value.trim();

        if (!title) {
            titleError.classList.remove('hidden');
            return;
        }
        if (!content) {
            contentError.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch('/add_post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`
            });

            if (response.ok) {
                titleInput.value = '';
                contentInput.value = '';
                showToast('Post added successfully', 'success');
                updatePosts();
            } else {
                showToast('Error adding post', 'error');
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });

    // Edit form submission
    const editForm = document.getElementById('edit-form');
    const editTitleInput = document.getElementById('edit-title');
    const editContentInput = document.getElementById('edit-content');
    const editTitleError = document.getElementById('edit-title-error');
    const editContentError = document.getElementById('edit-content-error');
    const cancelEdit = document.getElementById('cancel-edit');

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        editTitleError.classList.add('hidden');
        editContentError.classList.add('hidden');

        const index = document.getElementById('edit-index').value;
        const title = editTitleInput.value.trim();
        const content = editContentInput.value.trim();

        if (!title) {
            editTitleError.classList.remove('hidden');
            return;
        }
        if (!content) {
            editContentError.classList.remove('hidden');
            return;
        }

        try {
            const response = await fetch(`/edit_post/${index}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `title=${encodeURIComponent(title)}&content=${encodeURIComponent(content)}`
            });

            if (response.ok) {
                document.getElementById('edit-modal').classList.add('hidden');
                showToast('Post updated successfully', 'success');
                updatePosts();
            } else {
                showToast('Error updating post', 'error');
            }
        } catch (error) {
            showToast('Error: ' + error.message, 'error');
        }
    });

    cancelEdit.addEventListener('click', () => {
        document.getElementById('edit-modal').classList.add('hidden');
    });

    // Initial attachment of event listeners
    attachPostEventListeners();
});