import * as React from 'react';
import {
  PageSection,
  PageSectionVariants,
  Title,
  TextArea,
  Bullseye,
  Spinner,
  Stack,
  StackItem,
  Text,
  FileUpload,
  Form,
  FormGroup,
  ActionGroup,
  Button,
  Modal,
  ModalVariant,
  Alert
} from '@patternfly/react-core';
import { downloadBlob, b64toBlob } from '@app/utils/blob_utils';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";

const config_edit_header_text = "By uploading a configuration file, the contents of the specified configuration file will be applied to the VPN Server and the VPN Server program will automatically restart and upon restart, operate according to the new configuration contents. Because it is difficult for an administrator to write all the contents of a configuration file, we recommend you download the configuration file to get the current contents of the VPN Server configuration and save it to file."
const config_edit_footer_text = "You can then edit these contents in a regular text editor and then upload the configuration file to rewrite the contents to the VPN Server. This functionality is for people with a detailed knowledge of the VPN Server and if an incorrectly configured configuration file is written to the VPN Server, it not only could cause errors, it could also result in the loss of the current setting data. Take special care when carrying out this action. "

const EditConfig: React.FunctionComponent = () => (
  <PageSection variant={PageSectionVariants.light}>
  <Stack hasGutter>
    <StackItem>
      <Title headingLevel="h1" size="lg">
        Edit Config File
      </Title>
    </StackItem>
      <StackItem><Text>{config_edit_header_text}</Text></StackItem>
      <StackItem isFilled><ConfigTextArea /></StackItem>
      <StackItem><Alert variant="warning" isInline title="Extra carefulness is needed" >{config_edit_footer_text}</Alert></StackItem>
      <StackItem>
      <ConfigFileUpload />
      </StackItem>
    </Stack>
  </PageSection>
);

class ConfigTextArea extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      config: null
    };
  }

  componentDidMount(){
    api.GetConfig().then(response => {
      this.setState({ loading: false, config: response})
    });
  }

  renderConfig = config => {
    if (config != null){
      const config_text = atob(config.FileData_bin.toString()).slice(3);
      return (
        <TextArea className="config-textarea-tall" value={config_text} aria-label="Edit Config Text" isReadOnly autoResize />
      );
    }
  }

  render() {
    const { loading, config } = this.state;

    return (
      <React.Fragment>
        {loading ? <Bullseye><Spinner size="xl" /></Bullseye> : this.renderConfig(config)}
      </React.Fragment>
    );
  }
}

class ConfigFileUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '', filename: '', empty: true , isModalOpen: false };
    this.handleFileChange = (value, filename, empty) => {
      if (value === ''){
        empty = true;
      }
      else{
        empty = false;
      }
      this.setState({ value, filename, empty });
    };
    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };
  }

  fileUpload = (value, filename, empty) => {
    if (value === ''){
      empty = true;
    }
    else {
      empty = false;
      // console.log(value)
      // console.log(filename)
      this.handleModalToggle()
    }

    this.setState({ value, filename, empty });
    // console.log(this.state.empty)

  }

  confirmUpload = (value, filename) => {
    const bin = new TextEncoder().encode(value);
    // console.log(bin)
    const conf: VPN.VpnRpcConfig = new VPN.VpnRpcConfig(
      {
        FileData_bin: bin,
      });

    api.SetConfig(conf).then(response => {
      console.log(response.FileName_str + " has been uploaded")
    });
    value = ''
    filename = ''
    this.setState({value, filename})
    this.handleModalToggle()
  }

  cancelUpload = (value, filename) => {
    value = ''
    filename = ''
    this.setState({value, filename})
    this.handleModalToggle()
  }

  fileDownload = () => {
    api.GetConfig().then(response => {
      const blob = b64toBlob(response.FileData_bin.toString(), "text/plain");
      downloadBlob(blob, response.FileName_str);
    });
  }

  render() {
    const { value, filename, empty, isModalOpen } = this.state;
    return (
      <React.Fragment>
      <Form>
      <FormGroup
        fieldId="config-file"
        helperText="Upload a text file"
      >
      <FileUpload id="config-file" value={value} filename={filename} onChange={this.handleFileChange} type='text' hideDefaultPreview/>
      </FormGroup>
      <ActionGroup>
        <Button isDisabled={empty} onClick={() => this.fileUpload(value, filename)}>Upload Configuration File</Button>
        <Button onClick={() => this.fileDownload()}>Download Configuration File</Button>
        <Modal
          variant={ModalVariant.small}
          titleIconVariant="warning"
          title="Confirm Upload"
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={() => this.confirmUpload(value, filename)}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={() => this.cancelUpload(value, filename)}>
              Cancel
            </Button>
          ]}
        >
          If you confirm the upload the configuration of the VPN server will change and the VPN server will restart.
        </Modal>
      </ActionGroup>
      </Form>
      </React.Fragment>
    );
  }
}



export { EditConfig };
