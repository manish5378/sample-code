/*
This component is to create and edit habitude type challenge 
*/
// import npm packages
import React from "react";
import * as moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SimpleReactValidator from 'simple-react-validator';
import { toast } from "react-toastify";
import 'react-select/dist/react-select.min.css';

//Import server constant and function to call apis
import axios ,{BASE_URL } from "../../utils/api";
import "./challenges.css";

import {
  Button,
  Card,
  CardHeader,
  CardBody,
  Col,
  Form,
  FormFeedback,
  FormGroup,
  Label,
  Input,
  InputGroup,
  InputGroupAddon,
  Row
} from "reactstrap";

class AddHabitude extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      challenge: '',
      challengeType: "habitude",
      question: "",
      question_description: "",
      aboutChallenge: "",
      goalDescription: "",
      joinDescription: "",
      policyDescription: "",
      activityType: '',
      challengeStartDate:"",
      challengeEndDate:"",
      minValue: '',
      maxValue: '',
      image: '',
      validForm: true,
      options: [{ title: '', description: '' }],
      optionsLebel: {
                      0: "Option One",
                      1: "Option Two",
                      2: "Option Three",
                      3: "Option Four",
                      4: "Option Five" 
                    }
    };

    this.validator = new SimpleReactValidator();
  }

//function to add optional qustions in this challenge
  addOption = () => {
    let options = this.state.options;
    options.push({ title: '', description: '' });
    this.setState({ options });
  }

//function to remove optional qustions in this challenge
  removeOption = key => event => {

    let options = this.state.options;
    if ((key) > 0) {
      options.splice(key, 1)
    }
    this.setState({ options });
  }

  cancelAndGoBack = () => {
    this.props.history.push("/challenges");
  };
  
//function to handle oncChange event for image selection
fileSelectedHandler = event => {
    if (event.target.files[0]) {
      let image = URL.createObjectURL(event.target.files[0])

      this.setState(
        {
          uploadedFile: event.target.files[0],
          image
        });
    }
  };

//get image size
  imgEl = React.createRef();
  renderImageSize = () => {
    let data = this.imgEl.current
    if (data) {
      this.setState({ imageSizeData: this.imgEl.current.naturalWidth + ` *  ` + this.imgEl.current.naturalHeight })
    }
    else {
      this.setState({ imageSizeData: '' })
    }

  }

  componentDidMount() {
  
    let id = this.props.match.params.id;
    //if the challenge is open in edit mode then update the state variables
    if (id) {
      this.getChallengeDetail(id);
    }
  }

//function to get challenge detail by id and update state variables
  getChallengeDetail(id){
    axios.get(`view/created-challenges?challengeId=${id}`).then(
      res => {
        if(res.data.status == "200"){
          let challenge = res.data.challenges[0];
          let options = [];
          if (challenge.questionAndOptions.options.length > 0) {
              challenge.questionAndOptions.options.forEach(option =>
                options.push({ title: option.title, description: option.description })
              );
          }
          this.setState({
            challenge: challenge.title,
            aboutChallenge: challenge.challengeDescription.aboutChallenge,
            goalDescription: challenge.challengeDescription.goalDescription,
            joinDescription: challenge.challengeDescription.joinDescription,
            policyDescription: challenge.challengeDescription.policyDescription,
            question: challenge.questionAndOptions.question.title,
            question_description: challenge.questionAndOptions.question.description,
            options,
            image : BASE_URL+challenge.image,
            challengeStartDate: challenge.startDate,
            challengeEndDate: challenge.endDate,
          });
        } 
      });
  }

//function to handle oncChange event for input type text fields
  handleChange = event => {
    let state = this.state;
    this.setState({
      [event.target.name]: event.target.value,

    });
  };

//function to handle oncChange event for select box
  handleOptions(key, name, event) {
    let options = this.state.options;
    options[key][name] = event.target.value;
    this.setState({ options });
  }

 //Function to create/edit the challenge
  saveChallenge = async (event) => {
    event.preventDefault();

    if (this.validator.allValid()) {

      var formData = new FormData();

      const {
        challenge,
        uploadedFile,
        policyDescription,
        aboutChallenge,
        goalDescription,
        joinDescription,
        challengeStartDate,
        challengeEndDate,
        question,
        question_description,
        options
      } = this.state;
      
      let reqBody = {
        title: challenge,
        image: uploadedFile,
        type: "habitude",
        challengeDescription: JSON.stringify({aboutChallenge,goalDescription,joinDescription,policyDescription}),
        questionAndOptions: JSON.stringify({question: { title:question, description:question_description },options,}),
        endDate: moment( this.state.challengeEndDate).format('YYYY-MM-DD'),
        startDate:  moment( this.state.challengeStartDate).format('YYYY-MM-DD'),
      };

      for (var key in reqBody) {
        formData.append(key, reqBody[key]);
      }
      const id = this.props.match.params.id;
      if (!id) {
         await axios.post("create/challenge", formData)
          .then(res => {
            if (res.status == 200) {
              toast.success('Challenge Created Successfully');
              this.props.history.push("/challenges");
            }else{
              toast.error(res.message)
            }
          })
          .catch(err => {
              toast.error("There is some network issue. Please try again")
          });

      } else {
        await axios.put("edit/challenge/"+id, formData)
        .then(res => {
          if (res.status == 200) {
            toast.success('Challenge Edited Successfully');
            this.props.history.push("/challenges");
          }else{
            toast.error(res.message)
          }
        })
        .catch(err => {
          toast.error("There is some network issue. Please try again")
        });

      }
    } else {
      //show valiudation errors
      this.setState({ validForm: false });
      window.scrollTo(0, 0);
      this.validator.showMessages();      
      this.forceUpdate();
    }
  };

  //function to perorm onchange event for datepicker
  changeDate = (fieldName, date) => {
    let saveDate = moment(date).format('YYYY-MM-DD')
    this.setState({ [fieldName]: saveDate })
  }

  //function to handle onchange event for custom inputs fields for datepicker
  changeCustomInput=(e)=>{    
    if(e.target.name == "startDate"){
        this.setState({ challengeStartDate: "" })
    }
    if(e.target.name == "endDate"){
        this.setState({ challengeEndDate: "" })
    }    
  }

  render() {
    
    this.validator.purgeFields();
    const {challengeStartDate,challengeEndDate,validForm,challenge,policyDescription,joinDescription,image,imageSizeData,disableFields,
      question,question_description,aboutChallenge,goalDescription,options,optionsLebel} = this.state;
    
    let startDate = challengeStartDate ? moment(challengeStartDate).format('YYYY-MM-DD') : "";
    let endDate = challengeEndDate ? moment(challengeEndDate).format('YYYY-MM-DD') : "";
    let minimumStartDate = moment(new Date()).add(1,'days') ;

    //custom input that passed in datepicker
    const StartDateInput = ({ value, onClick }) => (
      <Input
        disabled={this.state.disableFields}
        required
        onClick={onClick}
        value={value}
        name="startDate"
        placeholder="Challenge Start Date"
        autoComplete="off"
        onChange={this.changeCustomInput}
      />
    );

    //custom input that passed in datepicker
    const EndDateInput = ({ value, onClick }) => (
        <Input
          disabled={this.state.disableFields}
          required
          onClick={onClick}
          value={value}
          placeholder="Challenge End Date"
          name="endDate"
          autoComplete="off"
          onChange={this.changeCustomInput}
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
                 {/*Challenge form start */}
                <Form name="simpleForm" className={!validForm ? "was-validated" : ''} >

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
                        {this.validator.message('challenge', challenge, 'required',
                          { messages: { default: 'Challenge Name Required!' }, className: "errorMessage" })}
                      </FormGroup>
                    </Col>

                    <Col lg={6}>
                      <FormGroup>
                        <Label htmlFor="name"> Image* </Label>                        
                        {image ? `  ` + imageSizeData : ""}
                        <Input name="image" id="image"  type="file" accept="image/x-png,image/gif,image/jpeg"  onChange={this.fileSelectedHandler} />
                        {this.validator.message('image',image, 'required',{ messages: { default: 'Please Select Image!' }, className: "errorMessage" })}
                        {image ? <img onLoad={this.renderImageSize} ref={this.imgEl} className="showImg" src={image} alt="image" /> : null} 

                    </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="Challenge-Name">Challenge Start Date </Label>
                        { startDate !="" ? 
                        <DatePicker
                          selected={new Date(startDate)}
                          id="challengeStartDate"
                          dateFormat="d-MM-yyyy"
                          minDate={new Date(minimumStartDate)}
                          onChange={date => this.changeDate("challengeStartDate", date)}
                          customInput={<StartDateInput />}
                        /> :
                        <DatePicker                        
                        id="challenge_startDate"
                        dateFormat="d-MM-yyyy"
                        minDate={new Date(minimumStartDate)}                      
                        onChange={date => this.changeDate("challengeStartDate", date)}
                        customInput={<StartDateInput />}
                      />}
                        {this.validator.message('startDate', startDate, 'required',{ messages: { default: 'Challenge Start Date Required!' }, className: "errorMessage" })}
                      </FormGroup>
                    </Col>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="activity_type">Challenge End Date</Label>
                        { endDate !=""  ? 
                        <DatePicker
                          customInput={<EndDateInput />}
                          dateFormat="d-MM-yyyy"
                          selected={new Date(endDate)}
                          minDate={new Date(startDate)}
                          onChange={date => this.changeDate("challengeEndDate", date)}
                        />: 
                        <DatePicker
                          customInput={<EndDateInput />}
                          dateFormat="d-MM-yyyy"
                          minDate={new Date(startDate)}
                          onChange={date => this.changeDate("challengeEndDate", date)}
                        />
                        }
                        {this.validator.message('endDate', startDate, 'required', { messages: { default: 'Challenge End Date Required!' }, className: "errorMessage" })}
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="contact">Question *</Label>
                        <Input
                          disabled={disableFields}
                          type="text"
                          required
                          name="question"
                          id="question"
                          placeholder="Question"
                          autoComplete="off"
                          value={question}
                          onChange={this.handleChange}
                        />
                        {this.validator.message('question',question, 'required',{ messages: { default: 'Please Enter Question!' }, className: "errorMessage" })}
                      </FormGroup>
                    </Col>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="contact">Description Of Question *</Label>
                        <Input
                          disabled={disableFields}
                          required
                          type="textarea"
                          rows={9}
                          name="question_description"
                          id="question_description"
                          placeholder="Description Of Question"
                          autoComplete="off"
                          value={question_description}
                          onChange={this.handleChange}
                        />
                        {this.validator.message('question_description',question_description, 'required',{ messages: { default: 'Please Write Question Description!' }, className: "errorMessage" })}
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="aboutChallenge">About The Challenge *</Label>
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
                        {this.validator.message('aboutChallenge',aboutChallenge, 'required',{ messages: { default: 'Please Write About The Challenge!' }, className: "errorMessage" })}
                      </FormGroup>
                    </Col>
                    <Col lg={6}>
                      <FormGroup>
                        <Label for="goalDescription">What's The Goal? * </Label>
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
                        {this.validator.message('goalDescription',goalDescription, 'required',{ messages: { default: 'Please Write About The Goal!' }, className: "errorMessage" })}
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
                        {this.validator.message('joinDescription',joinDescription, 'required',{ messages: { default: 'Please Describe How To Join!' }, className: "errorMessage" })}
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
                        {this.validator.message('policyDescription', policyDescription, 'required',{ messages: { default: 'Please Describe Privacy Policy!' }, className: "errorMessage" })}
                      </FormGroup>
                    </Col>
                  </Row>               
                  {/*render options dynamically */}
                  {options && options.length ? options.map((option, index) => (

                      <FormGroup row key={index}>
                        <Col md="6">

                          <InputGroup>

                            <Label for="contact" style={{ width: "100%" }}>{optionsLebel[index]} *</Label>
                            <Input
                              type="text"
                              name={"title" + index}
                              id={"title" + index}
                              placeholder={optionsLebel[index]}
                              autoComplete="off"
                              required
                              value={option.title}
                              onChange={this.handleOptions.bind(this, index, "title")}
                            />
                            <InputGroupAddon addonType="append">
                              {index > 0 ?
                                <Button type="button" color="danger" onClick={this.removeOption(index)} ><i className="fa fa-minus "></i> </Button>
                                : <Button type="button" color="primary" onClick={this.addOption} ><i className="fa fa-plus "></i> </Button>

                              }
                            </InputGroupAddon>
                            {this.validator.message("title" + index, option.title, 'required',
                              { messages: { default: 'Please Enter Title For ' + optionsLebel[index] }, className: "errorMessage" })}
                          </InputGroup>

                        </Col>
                        <Col md="6">
                          <InputGroup>
                            <Label for="contact" style={{ width: "100%" }}>{optionsLebel[index] + "  Description"} *</Label>
                            <Input

                              type="textarea"
                              rows={9}
                              name={"description" + index}
                              id={"description" + index}
                              required
                              placeholder={optionsLebel[index] + "  Description"}
                              autoComplete="off"
                              value={option.description}
                              onChange={this.handleOptions.bind(this, index, "description")}
                            />
                            {this.validator.message("description" + index, option.description, 'required',
                              { messages: { default: 'Please Enter Description For ' + optionsLebel[index] }, className: "errorMessage" })}

                          </InputGroup>
                        </Col>
                      </FormGroup>
                    )) : ''}
                  <FormGroup>
                    <Button onClick={this.saveChallenge} type="submit" color="primary" className="mr-1">
                      Submit
                    </Button>
                    <Button type="reset" color="danger" className="mr-1" onClick={this.cancelAndGoBack} >
                      Cancel
                    </Button>
                  </FormGroup>
                </Form>
                {/*Challenge form end */}
              </Col>
            </Row>
          </CardBody>
        </Card>
      </div>
    );
  }
}

export default AddHabitude;
