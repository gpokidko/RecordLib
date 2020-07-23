import React from "react";
import CSSBaseline from "@material-ui/core/CssBaseline";
import Navbar from "./components/Navbar";
import About from "./pages/About";
import UserProfile from "./pages/UserProfile";
import NotFound from "./components/NotFound";
import { MessagebarConnected } from "./components/Messagebar";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import ApplicantPage from "frontend/src/pages/ApplicantPage";
import SourceRecords from "frontend/src/pages/SourceRecords";
import RecordPage from "frontend/src/pages/RecordPage";
import PetitionsPage from "frontend/src/pages/PetitionsPage";
import Analysis from "frontend/src/pages/Analysis";
import AttorneyPage from "frontend/src/pages/AttorneyPage";

function App() {
  return (
    <main className="content" style={{ margin: "0px" }}>
      <React.Fragment>
        <CSSBaseline />
        <Router>
          <Navbar></Navbar>
          <Switch>
            <Route path="/about">
              <About />
            </Route>
            <Route path="/profile">
              <UserProfile />
            </Route>
            <Route path="/applicant">
              <ApplicantPage />
            </Route>
            <Route path="/attorney">
              <AttorneyPage />
            </Route>
            <Route path="/sourcerecords">
              <SourceRecords />
            </Route>
            <Route path="/criminalrecord">
              <RecordPage />
            </Route>
            <Route path="/analysis">
              <Analysis />
            </Route>
            <Route path="/petitions">
              <PetitionsPage />
            </Route>
            <Route path="/">
              <Redirect to="/applicant" />
            </Route>
            <Route path="">
              <Redirect to="/applicant" />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <MessagebarConnected />
        </Router>
      </React.Fragment>
    </main>
  );
}

export default App;
