import React, { Component } from 'react';
import { Message, Button, Form, Select } from 'semantic-ui-react';
import axios from 'axios';

class FormClient extends Component {

  constructor(props) {
    super(props);
    
    this.state = {
      name: '',
      email: '',
      phone: '',
      formClassName: '',
      formSuccessMessage: '',
      formErrorMessage: ''
    }

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    // Fill in the form with the appropriate data if client id is provided
    if (this.props.clientID) {
      axios.get(`${this.props.server}/api/clients/${this.props.clientID}`)
      .then((response) => {
        this.setState({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
        });
      })
      .catch((err) => {
        console.log(err);
      });
    }
  }

  handleInputChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({ [name]: value });
  }

  handleSelectChange(e, data) {
    this.setState({ gender: data.value });
  }

  handleSubmit(e) {
    // Prevent browser refresh
    e.preventDefault();

    const client = {
      name: this.state.name,
      email: this.state.email,
      phone: this.state.phone
    }

    // Acknowledge that if the client id is provided, we're updating via PUT
    // Otherwise, we're creating a new data via POST
    const method = this.props.clientID ? 'put' : 'post';
    const params = this.props.clientID ? this.props.clientID : '';

    axios({
      method: method,
      responseType: 'json',
      url: `${this.props.server}/api/clients/${params}`,
      data: client
    })
    .then((response) => {
      this.setState({
        formClassName: 'success',
        formSuccessMessage: response.data.msg
      });

      if (!this.props.clientID) {
        this.setState({
          name: '',
          email: '',
          phone: '',
        });
        this.props.onClientAdded(response.data.result);
        this.props.socket.emit('add', response.data.result);
      }
      else {
        this.props.onClientUpdated(response.data.result);
        this.props.socket.emit('update', response.data.result);
      }
      
    })
    .catch((err) => {
      if (err.response) {
        if (err.response.data) {
          this.setState({
            formClassName: 'warning',
            formErrorMessage: err.response.data.msg
          });
        }
      }
      else {
        this.setState({
          formClassName: 'warning',
          formErrorMessage: 'Something went wrong. ' + err
        });
      }
    });
  }

  render() {

    const formClassName = this.state.formClassName;
    const formSuccessMessage = this.state.formSuccessMessage;
    const formErrorMessage = this.state.formErrorMessage;

    return (
      <Form className={formClassName} onSubmit={this.handleSubmit}>
        <Form.Input
          label='Name'
          type='text'
          placeholder='Elon Musk'
          name='name'
          maxLength='40'
          required
          value={this.state.name}
          onChange={this.handleInputChange}
        />
        <Form.Input
          label='Email'
          type='email'
          placeholder='elonmusk@tesla.com'
          name='email'
          maxLength='40'
          required
          value={this.state.email}
          onChange={this.handleInputChange}
        />
        <Form.Group widths='equal'>
          <Form.Input
            label='Phone'
            type='text'
            placeholder='555-555-5555'
            min={12}
            max={30}
            name='phone'
            value={this.state.phone}
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <Message
          success
          color='green'
          header='Client created!'
          content={formSuccessMessage}
        />
        <Message
          warning
          color='yellow'
          header='Uh Oh!'
          content={formErrorMessage}
        />
        <Button color={this.props.buttonColor} floated='right'>{this.props.buttonSubmitTitle}</Button>
        <br /><br /> {/* Yikes! Deal with Semantic UI React! */}
      </Form>
    );
  }
}

export default FormClient;
