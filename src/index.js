const inquirer = require('inquirer');
const db = require('./dbQueries');
require('dotenv').config(); 

const mainMenu = async () => {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        'View all departments',
        'View all roles',
        'View all employees',
        'Add a department',
        'Add a role',
        'Add an employee',
        'Update employee role',
        'Exit'
      ]
    }
  ]);

  switch (action) {
    case 'View all departments':
      await db.getAllDepartments();
      break;
    case 'View all roles':
      await db.getAllRoles();
      break;
    case 'View all employees':
      await db.getAllEmployees();
      break;
    case 'Add a department':
      await db.addDepartment();
      break;
    case 'Add a role':
      await db.addRole();
      break;
    case 'Add an employee':
      await db.addEmployee();
      break;
    case 'Update employee role':
      await db.updateEmployeeRole();
      break;
    default:
      process.exit();
  }
  mainMenu();
};

mainMenu();
