const { Pool } = require('pg');
const inquirer = require('inquirer');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const getAllDepartments = async () => {
  const result = await pool.query('SELECT * FROM department');
  console.table(result.rows);
};

const getAllRoles = async () => {
  const result = await pool.query(`
    SELECT role.id, role.title, role.salary, department.name AS department
    FROM role
    JOIN department ON role.department_id = department.id
  `);
  console.table(result.rows);
};

const getAllEmployees = async () => {
  const result = await pool.query(`
    SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, 
           COALESCE(m.first_name || ' ' || m.last_name, 'None') AS manager 
    FROM employee e
    JOIN role ON e.role_id = role.id
    JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON e.manager_id = m.id
  `);
  console.table(result.rows);
};

const addDepartment = async () => {
  const { name } = await inquirer.prompt([
    { type: 'input', name: 'name', message: 'Enter department name:' }
  ]);
  await pool.query('INSERT INTO department (name) VALUES ($1)', [name]);
  console.log('Department added.');
};

const addRole = async () => {
  const departments = await pool.query('SELECT * FROM department');
  const departmentChoices = departments.rows.map(({ id, name }) => ({ name, value: id }));

  const { title, salary, department_id } = await inquirer.prompt([
    { type: 'input', name: 'title', message: 'Enter role title:' },
    { type: 'input', name: 'salary', message: 'Enter role salary:' },
    {
      type: 'list',
      name: 'department_id',
      message: 'Choose department for this role:',
      choices: departmentChoices
    }
  ]);

  await pool.query('INSERT INTO role (title, salary, department_id) VALUES ($1, $2, $3)', [title, salary, department_id]);
  console.log('Role added.');
};

const addEmployee = async () => {
  const roles = await pool.query('SELECT * FROM role');
  const roleChoices = roles.rows.map(({ id, title }) => ({ name: title, value: id }));

  const employees = await pool.query('SELECT * FROM employee');
  const managerChoices = employees.rows.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));
  managerChoices.push({ name: 'None', value: null });

  const { first_name, last_name, role_id, manager_id } = await inquirer.prompt([
    { type: 'input', name: 'first_name', message: 'Enter employee first name:' },
    { type: 'input', name: 'last_name', message: 'Enter employee last name:' },
    {
      type: 'list',
      name: 'role_id',
      message: 'Choose employee role:',
      choices: roleChoices
    },
    {
      type: 'list',
      name: 'manager_id',
      message: 'Choose employee manager:',
      choices: managerChoices
    }
  ]);

  await pool.query('INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ($1, $2, $3, $4)', [
    first_name,
    last_name,
    role_id,
    manager_id
  ]);
  console.log('Employee added.');
};


const updateEmployeeRole = async () => {
  const employees = await pool.query('SELECT * FROM employee');
  const employeeChoices = employees.rows.map(({ id, first_name, last_name }) => ({
    name: `${first_name} ${last_name}`,
    value: id
  }));

  const roles = await pool.query('SELECT * FROM role');
  const roleChoices = roles.rows.map(({ id, title }) => ({
    name: title,
    value: id
  }));

  const { employee_id, role_id } = await inquirer.prompt([
    {
      type: 'list',
      name: 'employee_id',
      message: 'Choose employee to update:',
      choices: employeeChoices
    },
    {
      type: 'list',
      name: 'role_id',
      message: 'Choose new role:',
      choices: roleChoices
    }
  ]);

  await pool.query('UPDATE employee SET role_id = $1 WHERE id = $2', [role_id, employee_id]);
  console.log('Employee role updated.');
};

module.exports = {
  getAllDepartments,
  getAllRoles,
  getAllEmployees,
  addDepartment,
  addRole,
  addEmployee,
  updateEmployeeRole
};
