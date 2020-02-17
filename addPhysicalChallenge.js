/*
This component is to create and edit physical type challenge 
*/
// import npm packages
import React from "react";
import * as moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import Select from "react-select";
import "react-select/dist/react-select.min.css";
import SimpleReactValidator from "simple-react-validator";

//Import server constant and function to call apis
import axios, { BASE_URL } from "../../utils/api";
import "./challenges.css";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  CustomInput,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Input,
  Row
} from "reactstrap";

class NewCompany extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenge: "",
      challengeType: "habitude",
      question: "",
      question_description: "",
      aboutChallenge: "",
      goalDescription: "",
      joinDescription: "",
      policyDescription: "",
      activityType: "",
      challengeStartDate: "",
      challengeEndDate: "",
      minValue: "",
      maxValue: "",
      image: "",
      validForm: true,
      activityOptions: [
        { value: "custom", label: "Custom" },
        { value: "steps", label: "Steps" },
        { value: "sleep", label: "Sleep" }
      ]
    };
    this.validator = new SimpleReactValidator();
  }

  cancelAndGoBack = () => {
    this.props.history.push("/challenges");
  };

  //function to handle oncChange event for image selection
  fileSelectedHandler = event => {
    if (event.target.files[0]) {
      let image = URL.createObjectURL(event.target.files[0]);

      this.setState({
        uploadedFile: event.target.files[0],
        image
      });
    }
  };

  imgEl = React.createRef();
  //get image size
  renderImagesize = () => {
    let data = this.imgEl.current;
    if (data) {
      this.setState({
        imageSizeData:
          this.imgEl.current.naturalWidth +
          ` *  ` +
          this.imgEl.current.naturalHeight
      });
    } else {
      this.setState({ imageSizeData: "" });
    }
  };

  componentDidMount() {
    let id = this.props.match.params.id;
    //if the challenge is open in edit mode then update the state variables
    if (id) {
      this.getChallengeDetail(id);
    }
  }

  //function to get challenge detail by id and update state variables
  getChallengeDetail(id) {
    axios.get(`view/created-challenges?challengeId=${id}`).then(res => {
      let challenge = res.data.challenges[0];

      this.setState({
        challenge: challenge.title,
        aboutChallenge: challenge.challengeDescription.aboutChallenge,
        goalDescription: challenge.challengeDescription.goalDescription,
        joinDescription: challenge.challengeDescription.joinDescription,
        policyDescription: challenge.challengeDescription.policyDescription,
        challengeStartDate: challenge.startDate,
        challengeEndDate: challenge.endDate,
        image: BASE_URL + challenge.image,
        activityType: challenge.activityType,
        maxValue: challenge.totalCount,
        minValue: challenge.minCount
      });
    });
  }

  //function to handle oncChange event for input type text fields
  handleChange = event => {
    let state = this.state;

    this.setState({
      [event.target.name]: event.target.value
    });
  };

  //function to save activity type
  saveActivityType = event => {
    if (event != null) {
      this.setState({ activityType: event.value });
    } else {
      this.setState({ activityType: "" });
    }
  };

  //Function to create/edit the challenge
  saveChallenge = async event => {
    event.preventDefault();
    if (this.validator.allValid()) {
      var formData = new FormData();

      let reqBody = {
        title: this.state.challenge,
        image: this.state.uploadedFile,
        type: "physical",

        challengeDescription: JSON.stringify({
          aboutChallenge: this.state.aboutChallenge,
          goalDescription: this.state.goalDescription,
          joinDescription: this.state.joinDescription,
          policyDescription: this.state.policyDescription
        }),
        activityType: this.state.activityType,
        endDate: moment(this.state.challengeEndDate).format("YYYY-MM-DD"),
        startDate: moment(this.state.challengeStartDate).format("YYYY-MM-DD")
      };

      if (this.state.activityType != "custom") {
        formData.append("totalCount", this.state.maxValue);
        formData.append("minCount", this.state.minValue);
      }

      for (var key in reqBody) {
        formData.append(key, reqBody[key]);
      }
      let id = this.props.match.params.id;
      if (!id) {
        await axios
          .post("create/challenge", formData)
          .then(res => {
            if (res.status == 200) {
              toast.success("Challenge Created Successfully");
              this.props.history.push("/challenges");
            }
          })
          .catch(err => {
            toast.error("There is some network issue. Please try again");
          });
      } else {
        await axios
          .put("edit/challenge/" + id, formData)
          .then(res => {
            if (res.status == 200) {
              toast.success("Challenge Edited Successfully");
              this.props.history.push("/challenges");
            }
          })
          .catch(err => {
            toast.error("There is some network issue. Please try again");
          });
      }
    } else {
      this.setState({ validForm: false });
      window.scrollTo(0, 0);
      this.validator.showMessages();
      this.forceUpdate();
    }
  };

  //function to perorm onchange event for datepicker
  handleChangeDate = (fieldName, date) => {
    let saveDate = moment(date).format("YYYY-MM-DD");

    this.setState({ [fieldName]: saveDate });
  };

  //function to handle onchange event for custom inputs fields for datepicker
  handleChangem = e => {
    if (e.target.name == "startDate") {
      this.setState({ challengeStartDate: "" });
    }

    if (e.target.name == "endDate") {
      this.setState({ challengeEndDate: "" });
    }
  };
  render() {
    this.validator.purgeFields();

    const {
      challengeStartDate,
      challengeEndDate,
      validForm,
      activityType,
      activityOptions,
      challenge,
      minValue,
      maxValue,
      policyDescription,
      joinDescription,
      image,
      imageSizeData,
      disableFields,
      aboutChallenge,
      goalDescription
    } = this.state;

    let startDate = challengeStartDate
      ? moment(challengeStartDate).format("YYYY-MM-DD")
      : "";
    let endDate = challengeEndDate
      ? moment(challengeEndDate).format("YYYY-MM-DD")
      : "";

    let minimumEndDate =
      activityType == "sleep"
        ? moment(challengeStartDate).add(14, "days")
        : moment(challengeStartDate).add(6, "days");

    let minimumStartDate = moment(new Date()).add(1, "days");

    //custom input that passed in datepicker
    const ExampleCustomInput = ({ value, onClick }) => (
      <Input
        disabled={this.state.disableFields}
        required
        onClick={onClick}
        value={value}
        name="startDate"
        placeholder="Challenge Start Date"
        autoComplete="off"
        onChange={this.handleChangem}
      />
    );

    //custom input that passed in datepicker
    const ExampleCustomInputEnd = ({ value, onClick }) => (
      <Input
        disabled={this.state.disableFields}
        required
        onClick={onClick}
        value={value}
        placeholder="Challenge End  Date"
        name="endDate"
        autoComplete="off"
        onChange={this.handleChangem}
      />
    );

    return (
      <div className="animated fadeIn">
        <Card>
          <CardHeader>
            <i className="icon-note"></i>
            <strong>Add Challenges</strong>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg="12">
                <Form
                  className={!validForm ? "was-validated" : ""}
                  name="simpleForm"
                >
                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="Challenge-Name">Challenge Name *</Label>
                        <Input
                          type="text"
                          name="challenge"
                          id="challenge"
                          placeholder="Challenge Name"
                          value={challenge}
                          required
                          onChange={this.handleChange}
                        />

                        {this.validator.message(
                          "challenge",
                          challenge,
                          "required",
                          {
                            messages: { default: "Challenge Name Required!" },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="activity_type">Activity Type *</Label>
                        <Select
                          className="form-control-warning"
                          id="activitytype"
                          name="activitytype"
                          value={activityType}
                          options={activityOptions}
                          onChange={e => {
                            this.saveActivityType(e);
                          }}
                          placeholder="Select Activity"
                        />
                        {this.validator.message(
                          "activitytype",
                          this.state.activityType,
                          "required",
                          {
                            messages: {
                              default: "Please Select Activity Type!"
                            },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                  </Row>
                  {this.state.activityType != "custom" ? (
                    <Row>
                      <Col lg={6}>
                        <FormGroup>
                          <Label for="Challenge-Name">Minimum Value *</Label>

                          <Input
                            disabled={disableFields}
                            type="text"
                            name="minValue"
                            id="minValue"
                            placeholder="Minimum Value"
                            required
                            value={minValue}
                            onChange={this.handleChange}
                          />
                          {this.validator.message(
                            "minValue",
                            minValue,
                            "required",
                            {
                              messages: {
                                default: "Please Select Minimum Value!"
                              },
                              className: "errorMessage"
                            }
                          )}
                        </FormGroup>
                      </Col>
                      <Col lg={6}>
                        <FormGroup>
                          <Label for="activity_type">Maximum Value *</Label>
                          <Input
                            disabled={false}
                            type="text"
                            name="maxValue"
                            id="maxValue"
                            placeholder="Maximum Value"
                            required
                            value={maxValue}
                            onChange={this.handleChange}
                          />
                          {this.validator.message(
                            "maxValue",
                            maxValue,
                            "required",
                            {
                              messages: {
                                default: "Please Select Maximum Value!"
                              },
                              className: "errorMessage"
                            }
                          )}
                        </FormGroup>
                      </Col>
                    </Row>
                  ) : (
                    ""
                  )}

                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="Challenge-Name">
                          Challenge Start Date *
                        </Label>
                        {startDate != "" ? (
                          <DatePicker
                            selected={new Date(startDate)}
                            id="challengeStartDate"
                            dateFormat="d-MM-yyyy"
                            minDate={new Date(minimumStartDate)}
                            onChange={date =>
                              this.handleChangeDate("challengeStartDate", date)
                            }
                            customInput={<ExampleCustomInput />}
                          />
                        ) : (
                          <DatePicker
                            customInput={<ExampleCustomInput />}
                            id="challenge_startDate"
                            dateFormat="d-MM-yyyy"
                            minDate={new Date(minimumStartDate)}
                            // minDate={new Date()}
                            onChange={date =>
                              this.handleChangeDate("challengeStartDate", date)
                            }
                          />
                        )}
                        {this.validator.message(
                          "startDate",
                          startDate,
                          "required",
                          {
                            messages: {
                              default: "Challenge Start Date Required!"
                            },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="activity_type">Challenge End Date *</Label>
                        {endDate != "" ? (
                          <DatePicker
                            customInput={<ExampleCustomInputEnd />}
                            dateFormat="d-MM-yyyy"
                            selected={new Date(endDate)}
                            minDate={new Date(minimumEndDate)}
                            onChange={date =>
                              this.handleChangeDate("challengeEndDate", date)
                            }
                          />
                        ) : (
                          <DatePicker
                            customInput={<ExampleCustomInputEnd />}
                            dateFormat="d-MM-yyyy"
                            //minDate={new Date(startDate)}
                            minDate={new Date(minimumEndDate)}
                            onChange={date =>
                              this.handleChangeDate("challengeEndDate", date)
                            }
                          />
                        )}
                        {this.validator.message(
                          "endDate",
                          startDate,
                          "required",
                          {
                            messages: {
                              default: "Challenge End Date Required!"
                            },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label htmlFor="name"> Image * </Label>
                        {`  ` + typeof imageSizeData != "undefined"
                          ? imageSizeData
                          : ""}

                        <Input
                          required
                          type="file"
                          accept="image/x-png,image/gif,image/jpeg"
                          onChange={this.fileSelectedHandler}
                        />

                        {image ? (
                          <img
                            onLoad={this.renderImagesize}
                            ref={this.imgEl}
                            className="showImg"
                            src={image}
                            alt="image"
                          />
                        ) : null}
                        {!image ? (
                          <FormFeedback className="help-block">
                            Please Choose Image{" "}
                          </FormFeedback>
                        ) : (
                          ``
                        )}
                        <FormFeedback
                          valid
                          className="help-block"
                        ></FormFeedback>
                      </FormGroup>
                    </Col>
                    <Col lg={6}></Col>
                  </Row>

                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="aboutChallenge">
                          About The Challenge *
                        </Label>
                        <Input
                          disabled={disableFields}
                          type="textarea"
                          rows={9}
                          required
                          name="aboutChallenge"
                          id="aboutChallenge"
                          placeholder="About The Challenge"
                          autoComplete="off"
                          value={aboutChallenge}
                          onChange={this.handleChange}
                        />
                        {this.validator.message(
                          "aboutChallenge",
                          aboutChallenge,
                          "required",
                          {
                            messages: {
                              default: "Please Write About The Challenge!"
                            },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="goalDescription">What's The Goal? *</Label>
                        <Input
                          disabled={disableFields}
                          type="textarea"
                          rows={9}
                          name="goalDescription"
                          id="goalDescription"
                          required
                          placeholder="What's The Goal"
                          autoComplete="off"
                          value={goalDescription}
                          onChange={this.handleChange}
                        />
                        {this.validator.message(
                          "goalDescription",
                          goalDescription,
                          "required",
                          {
                            messages: {
                              default: "Please Write About The Goal!"
                            },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="joinDescription">How To Join? *</Label>
                        <Input
                          disabled={disableFields}
                          type="textarea"
                          rows={9}
                          name="joinDescription"
                          id="joinDescription"
                          placeholder="How To Join"
                          autoComplete="off"
                          required
                          value={joinDescription}
                          onChange={this.handleChange}
                        />
                        {this.validator.message(
                          "joinDescription",
                          joinDescription,
                          "required",
                          {
                            messages: {
                              default: "Please Describe How To Join!"
                            },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="policyDescription">Privacy Policy *</Label>
                        <Input
                          disabled={disableFields}
                          type="textarea"
                          rows={9}
                          name="policyDescription"
                          id="policyDescription"
                          placeholder="Privacy Policy"
                          required
                          autoComplete="off"
                          value={policyDescription}
                          onChange={this.handleChange}
                        />
                        {this.validator.message(
                          "policyDescription",
                          policyDescription,
                          "required",
                          {
                            messages: {
                              default: "Please Describe Privacy Policy!"
                            },
                            className: "errorMessage"
                          }
                        )}
                      </FormGroup>
                    </Col>
                  </Row>

                  <FormGroup>
                    <Button
                      onClick={this.saveChallenge}
                      type="submit"
                      color="primary"
                      className="mr-1"
                    >
                      Submit
                    </Button>
                    <Button
                      type="reset"
                      color="danger"
                      className="mr-1"
                      onClick={this.cancelAndGoBack}
                    >
                      Cancel
                    </Button>
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default NewCompany;
