/*
This component is to list challenges
*/
// import npm packages
import React, { Component } from "react";
import axios from "../../utils/api";
import Moment from "react-moment";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Row,
  Col,
  FormGroup,
  Input,
  TabContent,
  TabPane,
  Nav,
  NavItem,
  NavLink,
  InputGroup,
  InputGroupAddon,
  Table
} from "reactstrap";
import classnames from "classnames";
import Pagination from "react-js-pagination";

// functional component to push habitude challenges
function UserRowH(props) {
  const challenges = props.challenges;
  const editChallenge = id => {
    props.editChallenge(id, "habitude");
  };

  const viewChallenge = id => {
    props.viewChallenge(id, "habitude");
  };

  return (
    <tr>
      <td>{challenges.title}</td>

      <td>
        <Moment format="DD-MM-YYYY">{challenges.startDate}</Moment>
      </td>
      <td>
        <Moment format="DD-MM-YYYY">{challenges.endDate}</Moment>
      </td>
      <td>
        {challenges.challengeAcceptedBy.length > 0 ? (
          <Button
            onClick={() => {
              viewChallenge(challenges._id);
            }}
            block
            color="warning"
          >
            View
          </Button>
        ) : (
          <Button
            onClick={() => {
              editChallenge(challenges._id);
            }}
            block
            color="warning"
          >
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}

// functional component to push physical challenges

function UserRow(props) {
  const challenges = props.challenges;
  const editChallenge = id => {
    props.editChallenge(id, "physical");
  };
  const viewChallenge = id => {
    props.viewChallenge(id, "physical");
  };
  return (
    <tr>
      <td>{challenges.title}</td>
      <td>{challenges.minCount}</td>
      <td>{challenges.totalCount}</td>
      <td>
        <Moment format="DD-MM-YYYY">{challenges.startDate}</Moment>
      </td>
      <td>
        <Moment format="DD-MM-YYYY">{challenges.endDate}</Moment>
      </td>
      <td>
        {challenges.challengeAcceptedBy.length > 0 ? (
          <Button
            onClick={() => {
              viewChallenge(challenges._id);
            }}
            block
            color="warning"
          >
            View
          </Button>
        ) : (
          <Button
            onClick={() => {
              editChallenge(challenges._id);
            }}
            block
            color="warning"
          >
            Edit
          </Button>
        )}
      </td>
    </tr>
  );
}

class Customers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: "1",
      challenges: [],
      physicalChallenges: [],
      habitudeChallenges: [],
      count: 0,
      activePage: 1,
      searchPattern: ""
    };
  }

  componentDidMount() {
    this.getChallenges("habitude");
  }

  // function to toggele the type of challenge tab
  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
    if (tab == 1) this.getChallenges("habitude");
    if (tab == 2) this.getChallenges("physical");
  }

  // function to get the challenges
  getChallenges = async (type, pagedata = "") => {
    if (pagedata == "") {
      pagedata = {
        skip: 0,
        count: 10
      };
    }
    let searchPattern = this.state.searchPattern;
    let url = `view/created-challenges?skip=${pagedata.skip}&count=${pagedata.count}&type=${type}`;
    if (searchPattern) {
      url = `view/created-challenges?skip=${pagedata.skip}&count=${pagedata.count}&type=${type}&searchPattern=${searchPattern}`;
    } else {
      url = `view/created-challenges?skip=${pagedata.skip}&count=${pagedata.count}&type=${type}`;
    }

    await axios
      .get(url)
      .then(res => {
        if (res.status == 200) {
          if (type == "physical") {
            this.setState({
              physicalChallenges: res.data.challenges,
              count: res.data.pageCount
            });
          } else {
            this.setState({
              habitudeChallenges: res.data.challenges,
              count: res.data.pageCount
            });
          }
        }
      })
      .catch(err => {
        if (type == "physical") {
          this.setState({
            physicalChallenges: []
          });
        } else {
          this.setState({
            habitudeChallenges: []
          });
        }
      });
  };

  // function to serach the challenges
  searchChallenges = async (value, type) => {
    this.setState(
      {
        searchPattern: value
      },
      () => {
        this.getChallenges(type);
      }
    );
  };

  // function used in pagination
  handlePageChange(pageNumber, type) {
    this.setState({
      activePage: pageNumber
    });

    let pagedata = {
      skip: (pageNumber - 1) * 10,
      count: 10
    };

    this.getChallenges(type, pagedata);
  }

  editChallenge = (id, type) => {
    this.props.history.push(`challenges/${type}/${id}`);
  };

  viewChallenge = (id, type) => {
    if (type == "physical") {
      this.props.history.push(`/challenges/view-physical/${id}`);
    } else {
      this.props.history.push(`/challenges/view-habitude/${id}`);
    }
  };

  render() {
    return (
      <div>
        <Nav tabs>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === "1" })}
              onClick={() => {
                this.toggle("1");
              }}
            >
              Habitude Challenges
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className={classnames({ active: this.state.activeTab === "2" })}
              onClick={() => {
                this.toggle("2");
              }}
            >
              Physical Challenges
            </NavLink>
          </NavItem>
        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          <TabPane tabId="1">
            <Row>
              <Col xl={12}>
                <Card>
                  <CardHeader>
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <InputGroup>
                            <InputGroupAddon addonType="prepend">
                              <Button disabled type="button" color="primary">
                                <i className="fa fa-search"></i>{" "}
                              </Button>
                            </InputGroupAddon>
                            <Input
                              onChange={e =>
                                this.searchChallenges(
                                  e.target.value,
                                  "habitude"
                                )
                              }
                              type="text"
                              id="input1-group2"
                              name="input1-group2"
                              placeholder="Search Habitude Challenge"
                            />
                          </InputGroup>
                        </FormGroup>
                      </Col>
                      <Col md="8">
                        <FormGroup>
                          <Button
                            onClick={() =>
                              this.props.history.push("/challenges/habitude")
                            }
                            type="button"
                            color="primary"
                            className="pull-right"
                          >
                            <i className="fa fa-add"></i> Add Habitude Challenge
                          </Button>
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th scope="col">Challenge Name</th>

                          <th scope="col">Start Date</th>
                          <th scope="col">End Date</th>
                          <th> Action </th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.habitudeChallenges &&
                        this.state.habitudeChallenges.length ? (
                          this.state.habitudeChallenges.map(
                            (challenges, index) => (
                              <UserRowH
                                key={index}
                                challenges={challenges}
                                editChallenge={this.editChallenge}
                                viewChallenge={this.viewChallenge}
                              />
                            )
                          )
                        ) : (
                          <tr>
                            <td colSpan="4">
                              <p>No challenges Found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </CardBody>
                  <div className="divStyle">
                    <Pagination
                      itemClass="page-item"
                      linkClass="page-link"
                      activePage={this.state.activePage}
                      itemsCountPerPage={5}
                      totalItemsCount={this.state.count}
                      pageRangeDisplayed={5}
                      onChange={value =>
                        this.handlePageChange(value, "habitude")
                      }
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
          <TabPane tabId="2">
            <Row>
              <Col xl={12}>
                <Card>
                  <CardHeader>
                    <Row>
                      <Col md="4">
                        <FormGroup>
                          <InputGroup>
                            <InputGroupAddon addonType="prepend">
                              <Button disabled type="button" color="primary">
                                <i className="fa fa-search"></i>
                              </Button>
                            </InputGroupAddon>
                            <Input
                              onChange={e =>
                                this.searchChallenges(
                                  e.target.value,
                                  "physical"
                                )
                              }
                              type="text"
                              id="input1-group2"
                              name="input1-group2"
                              placeholder="Search Physical Challenge"
                            />
                          </InputGroup>
                        </FormGroup>
                      </Col>
                      <Col md="8">
                        <FormGroup>
                          <Button
                            onClick={() =>
                              this.props.history.push("/challenges/physical")
                            }
                            type="button"
                            className="pull-right"
                            color="primary"
                          >
                            <i className="fa fa-add"></i> Add Physical Challenge
                          </Button>
                        </FormGroup>
                      </Col>
                    </Row>
                  </CardHeader>
                  <CardBody>
                    <Table responsive hover>
                      <thead>
                        <tr>
                          <th scope="col">Challenge Name</th>

                          <th scope="col">Minimum Target</th>
                          <th scope="col">Total Target</th>
                          <th scope="col">Start Date</th>
                          <th scope="col">End Date</th>
                          <th> Action </th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.state.physicalChallenges &&
                        this.state.physicalChallenges.length ? (
                          this.state.physicalChallenges.map(
                            (challenges, index) => (
                              <UserRow
                                key={index}
                                challenges={challenges}
                                viewChallenge={this.viewChallenge}
                                editChallenge={this.editChallenge}
                              />
                            )
                          )
                        ) : (
                          <tr>
                            <td colSpan="5">
                              <p>No challenges Found</p>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </CardBody>
                  <div className="divStyle">
                    <Pagination
                      itemClass="page-item"
                      linkClass="page-link"
                      activePage={this.state.activePage}
                      itemsCountPerPage={10}
                      totalItemsCount={this.state.count}
                      pageRangeDisplayed={10}
                      onChange={value =>
                        this.handlePageChange(value, "physical")
                      }
                    />
                  </div>
                </Card>
              </Col>
            </Row>
          </TabPane>
        </TabContent>
      </div>
    );
  }
}

export default Customers;
