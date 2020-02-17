/*
This component is to filter companies having employee as per the selected filters
*/
import React, { Component } from "react";
import Select from "react-select";
import { connect } from "react-redux";
import { searchCompany, getCompanyDetailData } from "../actions";
import { Row, Col } from "reactstrap";

class HealthDataFilter extends Component {
  //state variables
  state = {
    smoking: [],
    diabeties: [],
    activity_level: [],
    Cardiovascular_Disease: []
  };

  componentDidMount() {
    let {
      smoking,
      diabeties,
      activity_level,
      Cardiovascular_Disease
    } = this.props.activeFilter;

    this.setState({
      smoking,
      diabeties,
      activity_level,
      Cardiovascular_Disease
    });
  }

  //whenever it recieves props update the states
  componentWillReceiveProps(nextProps) {
    let {
      smoking,
      diabeties,
      activity_level,
      Cardiovascular_Disease
    } = this.props.activeFilter;

    this.setState({
      smoking,
      diabeties,
      activity_level,
      Cardiovascular_Disease
    });
  }

  //this function set the active filters and call updated company listings or company detail
  setFilter = () => {
    let activeFilter = { ...this.props.activeFilter };
    let statefilters = this.state;
    for (let key in statefilters) {
      if (
        typeof statefilters[key] != "undefined" &&
        (statefilters[key] != "" || statefilters[key].length != 0)
      ) {
        activeFilter[key] = statefilters[key];
      } else {
        delete activeFilter[key];
      }
    }

    this.props.setFilter(activeFilter);
    let pagedata = {
      skip: 0,
      count: 6
    };
    let filters = { ...activeFilter };
    if (this.props.type == "detail") {
      this.props.getCompanyDetailData(this.props.companyId, filters);
    } else {
      this.props.searchCompany(filters, pagedata);
    }
  };

  //this function handle select box event
  handleSelectBox = (event, field) => {
    if (event != null) {
      let values = event.map(x => x.value);
      this.setState({ [field]: values }, this.setFilter);
    }
  };

  render() {
    const {
      smokeFilter,
      diabetesFilter,
      activityOptions,
      diseaseOptions
    } = this.props;

    const {
      smoking,
      diabeties,
      activity_level,
      Cardiovascular_Disease
    } = this.state;

    return (
      <Row>
        <Col sm="4" md="2" className="mb-3 mb-xl-0">
          <Select
            className="form-control-warning"
            id="inputWarning2i"
            name="form-field-name2"
            value={smoking}
            options={smokeFilter}
            onChange={e => {
              this.handleSelectBox(e, "smoking");
            }}
            placeholder="Smoke Filter"
            multi
          />
        </Col>
        <Col sm="4" md="2" className="mb-3 mb-xl-0">
          <Select
            className="form-control-warning"
            id="inputWarning2i"
            name="form-field-name2"
            value={diabeties}
            options={diabetesFilter}
            onChange={e => {
              this.handleSelectBox(e, "diabeties");
            }}
            placeholder="Diabetes"
            multi
          />
        </Col>
        <Col sm="4" md="2" className="mb-3 mb-xl-0">
          <Select
            className="form-control-warning"
            id="inputWarning2i"
            name="form-field-name2"
            value={activity_level}
            options={this.props.activityOptions}
            onChange={e => {
              this.handleSelectBox(e, "activity_level");
            }}
            placeholder="Activity Level Filter"
            multi
          />
        </Col>

        <Col sm="4" md="2" className="mb-3 mb-xl-0">
          <Select
            className="form-control-warning"
            id="inputWarning2i"
            name="form-field-name2"
            value={Cardiovascular_Disease}
            options={diseaseOptions}
            onChange={e => {
              this.handleSelectBox(e, "Cardiovascular_Disease");
            }}
            placeholder="Cardiovascular Disease"
            multi
          />
        </Col>
      </Row>
    );
  }
}

//access to store's variables
const mapStateToProps = state => {
  return {
    smokeFilter: state.smokeFilter,
    diabetesFilter: state.diabetesFilter,
    activityOptions: state.activityOptions,
    diseaseOptions: state.diseaseOptions,
    activeFilter: state.activeFilter,
    type: state.type,
    companyId: state.companyId
  };
};

//dispatch actions
const mapDispatchToProps = dispatch => {
  return {
    searchCompany: (filters, data) => dispatch(searchCompany(filters, data)),
    setFilter: activeFilter =>
      dispatch({ type: "SET_FILTER", payload: activeFilter }),
    getCompanyDetailData: (id, data) => dispatch(getCompanyDetailData(id, data))
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(HealthDataFilter);
