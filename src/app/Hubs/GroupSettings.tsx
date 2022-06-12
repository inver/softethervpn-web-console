import React from "react";
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  FormSection,
  ActionGroup,
  TextInput,
  Stack,
  StackItem,
  Divider,
  Switch,
  Button,
  Flex,
  FlexItem
} from '@patternfly/react-core';
import { PolicyModal } from '@app/Hubs/SecurityPolicy';
import { api } from '@app/utils/vpnrpc_settings';


class GroupSettings extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      groupObject: this.props.group,
      create: this.props.create,
      saveDisabled: true
    }

    this.handleTextInputChange = (value, event) => {
      const name = event.target.name;
      const newState = this.state;
      newState.groupObject[name] = value;
      this.setState(newState)
    };

    this.handleUsePolicy = () => {
      const currentGroup = this.state.groupObject;
      currentGroup.UsePolicy_bool = !currentGroup.UsePolicy_bool;

      this.setState({groupObject: currentGroup});
    };

    this.handlePolicyChange = (newGroupObject) => {
      const oldGroupObject = this.state.groupObject;
      Object.keys(newGroupObject).forEach( key => {
        if(key.slice(0,6) === "policy:" ){
          oldGroupObject[key] = newGroupObject[key];
        }
      });

      this.setState({ groupObject: oldGroupObject })
    };

    this.handleEditSaveClick = () => {
      this.saveGroup()
    };

    this.onAlert = this.onAlert.bind(this);
  }

  onAlert(alertObject: object): void {
    this.props.onAlert(alertObject);
  }

  saveGroup(): void {
    const param = this.state.groupObject;
    const alertObject = {
      title: "",
      variant: 'info',
      body: ""
    }

    if(this.props.create){
      api.CreateGroup(param)
      .then( () => {
        alertObject.title = "A new group has been created";
        alertObject.variant = 'info';
        alertObject.body = "";
        this.onAlert(alertObject);
        this.props.updateGroups()
      })
      .catch( error => {
        alertObject.title = "An error has occurred";
        alertObject.variant = 'danger';
        alertObject.body = error.toString();
        this.onAlert(alertObject);
      });
    }
    else{
      api.SetGroup(param)
      .then( () => {
        alertObject.title = "The group has been modified";
        alertObject.variant = 'info';
        alertObject.body = "";
        this.onAlert(alertObject);
        this.props.updateGroups()
      })
      .catch( error => {
        alertObject.title = "An error has occurred";
        alertObject.variant = 'danger';
        alertObject.body = error.toString();
        this.onAlert(alertObject);
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<RouteComponentProps<{ tag: string }>>): void {
    if(!this.props.create){
      this.setState({
        groupObject: nextProps.group
      })
    }
  }

  render(): React.Fragment {
    const {
      groupObject,
      create,
      saveDisabled
    } = this.state;
    const saveDisabled = groupObject.Name_str === "" ? true : false;

    return (
      <React.Fragment>
      <Stack hasGutter id="editGroup">
      <StackItem>
      <Card>
      <CardBody>
      <Form isHorizontal>
      <FormSection>

      <FormGroup label="Group Name">
      <TextInput name="Name_str" value={groupObject.Name_str} type="text" onChange={this.handleTextInputChange} aria-label="group name input" isDisabled={!create}/>
      </FormGroup>

      <FormGroup label="Full Name">
      <TextInput name="Realname_utf" value={groupObject.Realname_utf} type="text" onChange={this.handleTextInputChange} aria-label="group full name input"/>
      </FormGroup>

      <FormGroup label="Note">
      <TextInput name="Note_utf" value={groupObject.Note_utf} type="text" onChange={this.handleTextInputChange}  aria-label="group note"/>
      </FormGroup>

      </FormSection>
      <Divider />
      <FormSection>
      <FormGroup>
      <Flex justifyContent={{ default: 'justifyContentSpaceBetween' }}>
      <FlexItem>
      <Switch
        id="policy-switch"
        label="Security policy enabled"
        labelOff="Security policy disabled"
        isChecked={groupObject.UsePolicy_bool === undefined ? false : groupObject.UsePolicy_bool}
        onChange={this.handleUsePolicy}
      />
      </FlexItem>
      <FlexItem>
      <PolicyModal isDisabled={!groupObject.UsePolicy_bool} onConfirm={this.handlePolicyChange} subject={groupObject} subjectType={1} />
      </FlexItem>
      </Flex>
      </FormGroup>
      </FormSection>
      <FormSection>
      <ActionGroup>
      <Button isDisabled={saveDisabled} onClick={this.handleEditSaveClick}>Save</Button>
      </ActionGroup>
      </FormSection>
      </Form>
      </CardBody>
      </Card>
      </StackItem>
      </Stack>
      </React.Fragment>
    );
  }
}

export { GroupSettings };
