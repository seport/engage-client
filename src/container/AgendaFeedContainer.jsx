import React, { Component } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { requestAgendas } from "../ducks/agendas";
import agenda_item_received from "../actions/Form";
import AgendaItemContainer from "./AgendaItemContainer.jsx";
import qs from "query-string";
import { Button, Grid } from "semantic-ui-react";

class AgendaFeed extends Component {
  constructor(props) {
    super(props);
    this.addId = this.addId.bind(this);
    this.removeId = this.removeId.bind(this);
    this.showForm = this.showForm.bind(this);
    this.recommendationReducer = this.recommendationReducer.bind(this);
    this.summaryReducer = this.summaryReducer.bind(this);
    this.goToForm = this.goToForm.bind(this);
    this.getMoreAgendas = this.getMoreAgendas.bind(this);
  }

  componentDidMount() {
    // Kick off action to make async call to our server for tags/topics.
    // This will then get stored in our redux state.
    console.log("ComponentDidMount");
    gtag("config", "UA-116538234-1", {
      page_title: "feed",
      page_path: "/feed"
    });
    const parsed = qs.parse(this.props.location.search);
    if (parsed && parsed.id) {
      this.requestedID = parseInt(parsed.id);
    }

    const { requestAgendas } = this.props;
    requestAgendas("agendas");
  }

  addId(id) {
    const parsed = qs.parse(this.props.location.search);
    parsed["id"] = id;
    this.props.history.push("/feed?" + qs.stringify(parsed));
  }

  removeId() {
    const parsed = qs.parse(this.props.location.search);
    delete parsed.id;
    this.props.history.push("/feed?" + qs.stringify(parsed));
  }
  recommendationReducer = (acc, curr) => {
    return acc + "<br />" + curr;
  };

  summaryReducer = (acc, curr) => {
    if (!this.gotBackground) {
      if (acc.toLowerCase().includes("summary")) {
        return curr;
      } else if (curr.toLowerCase().includes("background")) {
        this.gotBackground = true;
        return acc;
      } else {
        return acc + "<br />" + curr;
      }
    } else {
      return acc;
    }
  };
  showForm(proCon) {
    // this.requestedID is only useful at loading lifecycle event not afterward
    const parsed = qs.parse(this.props.location.search);
    if (parsed && parsed.id) {
      const { id, body, recommendations, title } = this.props.agendaItems[
        parsed.id
      ];
      let recommendationsString = "";
      // map to get recommendation from object and reduce array to string concatenated with <br />s
      if (recommendations.length > 0) {
        recommendationsString = recommendations
          .map(rec => {
            return rec.recommendation;
          })
          .reduce(this.recommendationReducer);
      }
      let summaryString = "";
      // slice and reduce array to string concatenated with <br />s
      if (body.length > 0) {
        summaryString = body.slice(0, 4).reduce(this.summaryReducer);
      }
      // Configure form content
      this.props.agenda_item_received({
        Title: title,
        Recommendations: recommendationsString,
        Summary: summaryString,
        Id: id,
        Pro: proCon === "pro"
      });
      setTimeout(this.goToForm, 200);
    }
  }
  goToForm() {
    this.props.history.push("/form"); // already set up!
  }

  getMoreAgendas() {
    const { requestAgendas } = this.props;
    requestAgendas(this.props.nextAgendaURL);
  }

  render() {
    const {
      agendaItems,
      agendaIDs,
      agendaLoading,
      agendaLoadError
    } = this.props;

    if (agendaLoadError.error) {
      return (
        <div style={{ color: "black" }}>Error: retrieving agenda items</div>
      );
    } else {
      return (
        <div style={{ color: "black" }}>
          {agendaIDs.map((agendaID, i) => {
            let agenda = agendaItems[agendaID];
            return (
              <AgendaItemContainer
                key={agenda.id}
                addId={this.addId}
                {...agenda}
                defaultOpen={agenda.id === this.requestedID}
                removeId={this.removeId}
                searchParams={this.props.location.search}
                showForm={this.showForm}
              />
            );
          })}
          <Grid style={{ margin: "6px" }} centered>
            {agendaLoading ? (
              <Button loading primary />
            ) : (
              <Button
                onClick={this.getMoreAgendas}
                content="Load More"
                primary
              />
            )}
          </Grid>
        </div>
      );
    }
  }
}

function mapStateToProps(state) {
  const agendas = state.agendas;
  return {
    agendaItems: agendas.agendaItems,
    agendaIDs: agendas.agendaIDs,
    agendaLoading: agendas.agendaLoading,
    agendaLoadError: agendas.agendaLoadError,
    nextAgendaURL: agendas.next
  };
}

function matchDispatchToProps(dispatch) {
  return bindActionCreators({ requestAgendas, agenda_item_received }, dispatch);
}

export default connect(mapStateToProps, matchDispatchToProps)(AgendaFeed);
