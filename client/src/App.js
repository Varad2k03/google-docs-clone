/* eslint-disable react/jsx-no-undef */
import { BrowserRouter as Router, Switch, Route, Redirect } from "react-router-dom";
import TextEditor from "./TextEditor";
import Login from "./Login";
import Signup from "./Signup";
import ProtectedRoute from "./ProtectedRoute";


function App() {
  return (
    <Router>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <ProtectedRoute path="/documents/:id" component={TextEditor} />
        <Route path="/" exact component={() => <Redirect to="/login" />} />
      </Switch>
    </Router>
  );
}

export default App;
