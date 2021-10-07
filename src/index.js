const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find(user => user.username === username)
  if (!user)
    return response.status(404).json({ error: 'User does not exist! ' });

  request.user = user;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  if (users.find(user => user.username === username)) {
    return response.status(400).json({ error: "User already exists!" }).send()
  } else {
    const user = {
      id: uuidv4(),
      name: name,
      username: username,
      todos: [],
    };
    users.push(user)

    return response.status(201).json(user)
  }
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;

  const user = users.find(user => user.username === username)
  if (user)
    return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;

  const user = users.find(user => user.username === username)
  if (user) {
    const todo = {
      id: uuidv4(),
      title: title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(todo)

    return response.status(201).json(todo)
  }

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username)

  if (user) {
    user.todos.find((todo) => {
      if (todo.id === id) {
        todo.title = title;
        todo.deadline = deadline
        return response.status(201).json(todo)
      }
    })
  }
  return response.status(404).json({ error: 'Todo does not exist!' })

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username)

  if (user) {
    user.todos.find((todo) => {
      if (todo.id === id) {
        todo.done = true;
        return response.status(201).json(todo)
      }
    })
  }
  return response.status(404).json({ error: 'Todo does not exist!' })

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers;
  const { id } = request.params;

  const user = users.find(user => user.username === username)

  if (user) {
    user.todos.find((todo) => {
      console.log(todo)
      if (todo.id === id) {
        user.todos.splice(todo, 1)
        return response.status(204).json(user)
      }
    })
  }

  return response.status(404).json({ error: 'Todo does not exist!' })
});

module.exports = app;