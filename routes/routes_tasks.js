const express = require('express');
const router = express.Router();
const dateformat = require('dateformat');
const bcrypt = require('bcryptjs');
const passport = require('passport');

// Bring in models
let Task = require('../models/task');
let User = require('../models/user');

// Routes
  //DOM: Show 'Task List' Page
  router.get('/view', function(req,res){
    Task.find({}, function(err, tasks){
      if(err){
        console.log(err);
      } else {
        res.render('page_tasklist', {
          title: 'View Current Tasks',
          tasks: tasks
        });
      }
    })
  });

  //DOM: Show 'Add a Task' Page
  //router.get('/add', ensureAuthenticated, function(req,res){
  router.get('/add', function(req,res){
      res.render('page_taskadd', {
      title: 'Add a New Task'
    });
  });

  //POST: Add a Task to DB
  router.post('/add', function(req,res){
    // req.checkBody('input_Creator', 'Creator is required').notEmpty();
    req.checkBody('input_Assigned', 'Assigned To is required').notEmpty();
    req.checkBody('input_DueDate', 'Due Date is required').notEmpty();
    req.checkBody('input_Task', 'Task Title is required').notEmpty();

    // Get Errors and handle
    let errors = req.validationErrors();
    if(errors){
        res.render('page_taskadd',{
            title: 'Add a New Task',
            errors:errors
        });
    } else {
      let task = new Task();
      task.creator = req.user._id;
      task.assignedTo = req.body.input_Assigned
      task.dueDate = req.body.input_DueDate
      task.tasktitle = req.body.input_Task
      task.taskbody = req.body.input_Body
      task.save(function(err){
        if(err){
          console.log(err);
          return;
        } else {
            console.log(task);
            req.flash('success', 'Task added!');
            res.redirect('/tasks/view');
          }
      });
      }
    });

  //POST: Edit a task in database
  router.post('/edit/:id', function(req,res){
      let task = {};
      task.assignedTo = req.body.input_Assigned
      task.dueDate = req.body.input_DueDate
      task.tasktitle = req.body.input_Task
      task.taskbody = req.body.input_Body
      let query = {_id:req.params.id};
      Task.update(query, task, function (err) {
          if(err){
              console.log(err);
              return;
          } else {
              req.flash('success', 'Task updated!');
              res.redirect('/view');
          }
      })
  });

  //DOM: Show 'Edit a Task' Page
  router.get('/edit/:id', function(req,res){
    Task.findById(req.params.id, function(err, task){
      res.render('page_taskedit', {
        title: task.tasktitle,
        task:task
      });
    });
  });

  // DELETE: Removes task from database
  router.delete('/delete/:id', function (req,res) {
    let query = {_id:req.params.id}
    Task.remove(query, function (err) {
      if(err){
        console.log(err);
      } else {
      res.send('Success');
      req.flash('success', 'Task deleted!');
      }
    });
  });

  //DOM: Show a single Task page
  router.get('/view/:id', function (req,res) {
      Task.findById(req.params.id, function (err, task) {
        User.findById(task.creator, function(err,user){
          res.render('page_task', {
              task:task,
              tasktitle:task.tasktitle,
              assignedTo:task.assignedTo,
              dueDate:dateformat(task.dueDate, 'fullDate'),
              taskbody:task.taskbody,
              creator:task.creator
          });
        })
      });
  });

  // Access control
  // User Authentication scheme to prevent manual add/edit url entry not working; app hangs on authenticated user access.
  function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      return next;
    } else {
      req.flash('danger', 'Please login.');
      res.redirect('/users/login');
    }
  }

module.exports = router;
