import React from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardFooter,
  Bullseye,
  Spinner,
  Stack,
  StackItem,
  Form,
  FormGroup,
  Button,
  Modal,
  ModalVariant,
  FileUpload,
  TextInput,
  Alert,
  Flex,
  FlexItem,
  ActionGroup
} from '@patternfly/react-core';
import { api } from '@app/utils/vpnrpc_settings';
import * as VPN from "vpnrpc/dist/vpnrpc";
import * as x509 from "../../../../node_modules/@peculiar/x509";
import { crt_field2object } from '@app/utils/string_utils';
import { ViewCertModal } from '@app/CertificateViewer/CertificateViewer';
import { downloadBlob } from '@app/utils/blob_utils';
import { ddnsGlobal } from '@app/index'

function formatKey(key: string): strings
{
  let formattedKey = "-----BEGIN PRIVATE KEY-----\n";
  for(let i = 0; i<key.length; i++){
    formattedKey = formattedKey.concat(key[i]);
    if((i+1)%64 == 0){
      formattedKey = formattedKey.concat("\n");
    }
  }

  if(formattedKey[formattedKey.length] != "\n"){
    formattedKey = formattedKey.concat("\n");
  }
  formattedKey = formattedKey.concat("-----END PRIVATE KEY-----");

  return formattedKey;
}

class ServerCertificateCard extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      certBin: "",
      keyBin: "",
      isUploadModalOpen: false,
      certValue: "",
      certFilename: "",
      keyValue: "",
      keyFilename: "",
      certValid: "default",
      keyValid: "default",
      isNewCertModalOpen: false,
      cnValue: "",
    }

    this.handleUploadModalToggle = () => {
      this.setState(({ isUploadModalOpen }) => ({
        isUploadModalOpen: !isUploadModalOpen
      }));
    };

    this.handleNewCertModalToggle = () => {
      this.setState(({ isNewCertModalOpen }) => ({
        isNewCertModalOpen: !isNewCertModalOpen
      }));
    };

    this.handleCertFileChange = (certValue, certFilename, event) => {
      if(certFilename != ""){
        certValue.text().then(value => {
          let valid = "default"

          if(value.slice(0,27) != "-----BEGIN CERTIFICATE-----"){
            valid = "error";
          }
          else{
            let certSlice = value.slice(-26);

            if(certSlice.slice(-1) == "\n"){
              certSlice = certSlice.slice(0,-1);
            }

            if(certSlice.slice(0,1) != "-"){
              certSlice = certSlice.slice(1);
            }

            if( certSlice != "-----END CERTIFICATE-----"){
              valid = "error";
              console.log(certSlice)
            }
          }

          this.setState({ certValue: certValue, certFilename: certFilename, certValid: valid });
        })
        .catch( error => {
          console.log(error)
        });
      }
      else{
        this.setState({ certValue: certValue, certFilename: certFilename, certValid: "default" });
      }


    };

    this.handleKeyFileChange = (keyValue, keyFilename, event) => {
      if(keyFilename != ""){
        keyValue.text().then(value => {
          let valid = "default"

          if(value.slice(0,27) != "-----BEGIN PRIVATE KEY-----"){
            valid = "error";
          }
          else{
            let keySlice = value.slice(-26);

            if(keySlice.slice(-1) == "\n"){
              keySlice = keySlice.slice(0,-1);
            }

            if(keySlice.slice(0,1) != "-"){
              keySlice = keySlice.slice(1);
            }

            if( keySlice != "-----END PRIVATE KEY-----"){
              valid = "error";
            }
          }
          this.setState({ keyValue: keyValue, keyFilename: keyFilename, keyValid: valid });
        })
        .catch( error => {
          console.log(error);
        });
      }
      else{
        this.setState({ keyValue: keyValue, keyFilename: keyFilename, keyValid: "default" });
      }
    };


    this.handleCertKeyUpload = () => {
      this.state.certValue.text().then( valueCert => {

        this.state.keyValue.text().then( valueKey => {

          let param: VPN.VpnRpcKeyPair = new VPN.VpnRpcKeyPair({
            Cert_bin: new TextEncoder().encode(valueCert),
            Key_bin: new TextEncoder().encode(valueKey),
          });

          api.SetServerCert(param)
          .then(response => {
            this.setState({ loading: true,
              isUploadModalOpen: false, certValue: "",
              certFilename: "",
              keyValue: "",
              keyFilename: ""
          });
          })
          .catch(error => {
            console.log(error)
          });
        })
        .catch( error => {
          console.log(error)
        });
      })
    }

    this.handleCNInputChange = cnValue => {
      this.setState({ cnValue: cnValue });
    }

    this.handleNewCert = () => {

      let param: VPN.VpnRpcTest = new VPN.VpnRpcTest({
        StrValue_str: this.state.cnValue
      });

      api.RegenerateServerCert(param)
      .then( response => {
        this.setState({ isNewCertModalOpen: false })
        window.location.reload();
      })
      .catch(error => {
        console.log(error)
      });
    }
  }


  componentDidMount(){
    api.GetServerCert()
    .then( response => {

      let cn = ""

      if(ddnsGlobal != ""){
        cn = ddnsGlobal;
      }
      else{
        let certificate = new x509.X509Certificate(response.Cert_bin);
        cn = rt_field2object(certificate.subject)["CN"];
      }

      this.setState({
        loading: false,
        certBin: response.Cert_bin,
        keyBin: response.Key_bin,
        cnValue: cn
      });

    })
    .catch( error => {
      console.log(error)
    });
  }

  componentDidUpdate(){
    if(this.state.loading){
      api.GetServerCert()
      .then( response => {
        this.setState({
          loading: false,
          certBin: response.Cert_bin,
          keyBin: response.Key_bin
        });
      })
      .catch( error => {
        console.log(error)
      });
    }
  }

  render(){
    const { loading, certBin, keyBin, isUploadModalOpen, certValue, certFilename, keyValue, keyFilename, certValid, keyValid, isNewCertModalOpen, cnValue } = this.state;

    let issuedTo = ""
    let issuedBy = ""
    let expDate = ""
    let certAndKey = ""

    if(certBin != ""){
      let cert = new x509.X509Certificate(certBin);

      certAndKey = certAndKey.concat(cert.toString());
      certAndKey = certAndKey.concat("\n");
      certAndKey = certAndKey.concat(formatKey(keyBin));

      issuedTo = crt_field2object(cert.subject)["CN"];
      issuedBy = crt_field2object(cert.issuer)["CN"];
      expDate = cert.notAfter.toLocaleDateString();

      const downloadCertKey = () => {
        downloadBlob(new Blob([certAndKey], { type: "text/plain"}), issuedTo + ".pem")
        // console.log(name)
      }

    }

    return(
      <React.Fragment>
      <Card isRounded isCompact>
      <CardHeader><b>Server Certificate Settings</b></CardHeader>
       <CardBody isFilled>
       <Stack hasGutter>
       <StackItem>
       Specify the X509 Certificate and private key to be presented to clients by this server.
       </StackItem>
       <StackItem>
       <Card>
       <CardBody>
       <b>Issued to:</b> {loading ? <Spinner size="sm" /> : issuedTo }<br/>
       <b>Issued by:</b> {loading ? <Spinner size="sm" /> : issuedBy }<br/>
       <b>Expiration:</b> {loading ? <Spinner size="sm" /> : expDate }
       </CardBody>
       </Card>
       </StackItem>
       <StackItem>
       <Flex>
       <FlexItem align={{ default: 'alignRight' }}>
       <Form>
          <ActionGroup>
          <Button variant="primary" onClick={this.handleNewCertModalToggle}>New Certificate</Button>

          <Button variant="primary" onClick={this.handleUploadModalToggle}>Upload Certificate</Button>

          <Button variant="primary" onClick={downloadCertKey}>Download Certificate and Key</Button>

          <ViewCertModal buttonText="View" certBin={certBin}/>
          </ActionGroup>
        </Form>
        </FlexItem>
        </Flex>
       </StackItem>
       </Stack>
       </CardBody>
      </Card>
        <Modal
          variant={ModalVariant.small}
          title="Generate New Certificate"
          isOpen={isNewCertModalOpen}
          onClose={this.handleNewCertModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleNewCert} isDisabled={cnValue == ""}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleNewCertModalToggle}>
              Cancel
            </Button>
          ]}
        >
        <Stack hasGutter>
        <StackItem>
          You can generate a new self-signed certificate with the specified Common Name.
          </StackItem>
          <StackItem>
          <Form>
          <FormGroup label="Common Name" fieldId="cnInput" validated={cnValue == "" ? "error" : "default"} helperTextInvalid="Common Name cannot be empty">
            <TextInput value={cnValue} type="text" onChange={this.handleCNInputChange} aria-label="CN input" id="cnInput" validated={cnValue == "" ? "error" : "default"} />
          </FormGroup>
          </Form>
          </StackItem>
          <StackItem>
            <Alert variant="info" isInline title="OpenVPN clients may be affected" >
              If you are using OpenVPN protocols, please mind that you may have to update the inline certificate data in the OpenVPN configuration file.
            </Alert>
          </StackItem>
          <StackItem>
            <Alert variant="warning" isInline title="VPN clints may be affected" >
            The certificate of VPN Server is being replaced to the new one. This will affect all VPN Clients which are configured to verify the certificate of the VPN Server.
            </Alert>
          </StackItem>
          </Stack>
        </Modal>
        <Modal
          variant={ModalVariant.medium}
          title="Select Certificate and Key Files"
          isOpen={isUploadModalOpen}
          onClose={this.handleUploadModalToggle}
          actions={[
            <Button key="confirm" variant="primary" onClick={this.handleCertKeyUpload} isDisabled={!(certValid == "default" && keyValid == "default" && certFilename != "" && keyFilename != "")}>
              Confirm
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleUploadModalToggle}>
              Cancel
            </Button>
          ]}
        >
          <Form>
          <FormGroup
            label="Certificate"
            fieldId="certificate-file"
            helperTextInvalid="Format not recognised"
            validated={certValid}
          >
            <FileUpload id="certificate-file" validated={certValid} value={certValue} filename={certFilename} onChange={this.handleCertFileChange} />
          </FormGroup>
          <FormGroup
            label="Key"
            fieldId="key-file"
            validated={keyValid}
            helperTextInvalid="Format not recognised"
          >
            <FileUpload id="key-file" validated={keyValid} value={keyValue} filename={keyFilename} onChange={this.handleKeyFileChange} />
          </FormGroup>
          </Form>
        </Modal>
      </React.Fragment>
    );
  }
}

export { ServerCertificateCard };
