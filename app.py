from flask import Flask, request, render_template
from datetime import datetime

app = Flask(__name__)

# In-memory list to store posts
posts = []

@app.route('/')
def index():
    return render_template('index.html', posts=posts)

@app.route('/add_post', methods=['POST'])
def add_post():
    title = request.form.get('title')
    content = request.form.get('content')
    if title and content:
        posts.append({
            'title': title,
            'content': content,
            'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        })
    return render_template('index.html', posts=posts)

@app.route('/delete_post/<int:index>', methods=['POST'])
def delete_post(index):
    if 0 <= index < len(posts):
        posts.pop(index)
    return render_template('index.html', posts=posts)

@app.route('/edit_post/<int:index>', methods=['POST'])
def edit_post(index):
    if 0 <= index < len(posts):
        title = request.form.get('title')
        content = request.form.get('content')
        if title and content:
            posts[index] = {
                'title': title,
                'content': content,
                'created_at': posts[index]['created_at']  # Preserve original timestamp
            }
    return render_template('index.html', posts=posts)

if __name__ == '__main__':
    app.run(debug=True, port=5000)