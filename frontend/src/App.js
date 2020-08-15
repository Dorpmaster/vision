import React from 'react'
import Routes from './Routes'
import { Link } from 'react-router-dom'
import { Nav, Navbar, NavLink } from 'react-bootstrap'
import './App.css'

function App () {
  return (
    <div className="App container">
      <Navbar bg="light" expand="lg">
        <Navbar.Brand as={Link} to="/">Scratch</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mr-auto">
            <NavLink as={Link} to="/test">Test</NavLink>
          </Nav>
          <Nav>
            <NavLink as={Link} to="/signup">Signup</NavLink>
            <NavLink as={Link} to="/login">Login</NavLink>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      <Routes/>
    </div>
  )
}

export default App
