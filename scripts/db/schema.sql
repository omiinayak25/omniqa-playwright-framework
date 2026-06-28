-- =====================================================================
--  Automation test database schema (idempotent / re-runnable).
--  Exercises: foreign keys, constraints, a view, indexes, a stored
--  function (procedure-like), and a seed dataset.
--  Run as postgres; objects are owned by automation_user via SET ROLE.
-- =====================================================================
SET ROLE automation_user;

DROP VIEW IF EXISTS active_employees CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- ---- Departments ----
CREATE TABLE departments (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE
);

-- ---- Employees (FK -> departments, CHECK constraints) ----
CREATE TABLE employees (
  id            SERIAL PRIMARY KEY,
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  department_id INTEGER NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  salary        NUMERIC(10, 2) NOT NULL CHECK (salary > 0),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Indexes (beyond the implicit PK / UNIQUE) ----
CREATE INDEX idx_employees_last_name ON employees (last_name);
CREATE INDEX idx_employees_department ON employees (department_id);

-- ---- View: only active employees with their department name ----
CREATE VIEW active_employees AS
SELECT e.id, e.first_name, e.last_name, e.email, d.name AS department, e.salary
FROM employees e
JOIN departments d ON d.id = e.department_id
WHERE e.is_active = TRUE;

-- ---- Stored function: apply a percentage raise, return new salary ----
CREATE OR REPLACE FUNCTION give_raise(emp_id INTEGER, pct NUMERIC)
RETURNS NUMERIC AS $$
DECLARE
  new_salary NUMERIC;
BEGIN
  UPDATE employees
  SET salary = ROUND(salary * (1 + pct / 100.0), 2)
  WHERE id = emp_id
  RETURNING salary INTO new_salary;
  RETURN new_salary;
END;
$$ LANGUAGE plpgsql;

-- ---- Products sync sink (target of the API→DB E2E reconciliation flow) ----
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  external_id INTEGER NOT NULL UNIQUE,   -- source system (DummyJSON) id
  title       VARCHAR(255) NOT NULL,
  price       NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  category    VARCHAR(100),
  synced_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---- Seed data ----
INSERT INTO departments (name) VALUES ('Engineering'), ('Quality Assurance'), ('Operations');

INSERT INTO employees (first_name, last_name, email, department_id, salary, is_active) VALUES
  ('Ada',   'Lovelace', 'ada.lovelace@example.test',   1, 95000.00, TRUE),
  ('Alan',  'Turing',   'alan.turing@example.test',    1, 98000.00, TRUE),
  ('Grace', 'Hopper',   'grace.hopper@example.test',    2, 91000.00, TRUE),
  ('Edsger','Dijkstra', 'edsger.dijkstra@example.test', 2, 89000.00, FALSE);

RESET ROLE;
