import React from 'react';
import {
  Modal,
  ModalVariant,
  Button,
  Stack,
  StackItem,
  Card,
  CardTitle,
  CardBody,
  CardFooter,
  DataList,
  DataListItem,
  DataListItemRow,
  DataListItemCells,
  DataListCell,
} from '@patternfly/react-core';
import * as x509 from "../../../node_modules/@peculiar/x509";
import { crt_field2object } from '@app/utils/string_utils';
import { downloadBlob, b64toBlob } from '@app/utils/blob_utils';

function prettyHex(rawString: string): string
{
  let string = ""
  for (let i=0; i<rawString.length; i++){
    string = string.concat(rawString[i]);
    if((i+1)%2 == 0){
      string = string.concat(" ");
    }
  }
  string = string.toUpperCase();
  return string;
}

class ViewCertModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalOpen: false,
      cert: null,
      issuedTo: "",
      issuer: "",
      expiresAt: ""
    };
    this.handleModalToggle = () => {
      this.setState(({ isModalOpen }) => ({
        isModalOpen: !isModalOpen
      }));
    };


  }

  componentDidUpdate(){
    if(this.props.certBin != null && this.state.cert == null ){
      let cert = new x509.X509Certificate(this.props.certBin);
      this.setState({ cert: cert });
      // console.log(cert)
      // console.log(crt_field2object(cert.subject))
    }
  }

  render() {
    const { isModalOpen, cert, issuedTo, issuer, expiresAt } = this.state;

    let name = ""

    if(cert != null){
      let issuedToObject = crt_field2object(cert.subject);
      let issuedByObject = crt_field2object(cert.issuer);
      let pubKey = prettyHex(cert.publicKey.toString("hex"));
      let signatureView = new Uint32Array(cert.signature);
      let signatureStr = ""
      for (let i = 0; i<signatureView.length; i++){
        signatureStr = signatureStr.concat(signatureView[i]);
      }
      let signature = prettyHex(signatureStr)
      name = issuedToObject["CN"];

      const downloadCert = () => {
        downloadBlob(new Blob([cert.toString()], { type: "text/plain"}), name + ".pem");
        // console.log(name)
      }

      let title_completion = this.props.name;

      if (title_completion == "" || title_completion == null || title_completion == undefined){
        title_completion = issuedToObject["CN"];
      }
    }




    return (
      <React.Fragment>
        <Button variant="primary" onClick={this.handleModalToggle} isDisabled={this.props.isDisabled}>
          {this.props.buttonText}
        </Button>
        <Modal
          variant={ModalVariant.large}
          title={"Certificate for " + title_completion}
          isOpen={isModalOpen}
          onClose={this.handleModalToggle}
          actions={[
            <Button key="download" variant="primary" onClick={downloadCert}>
              Download Certificate
            </Button>,
            <Button key="cancel" variant="link" onClick={this.handleModalToggle}>
              Close
            </Button>
          ]}
        >
        { cert == null ? "Loading..." :
        <Stack>
        <StackItem>
          <Card isCompact>
            <CardTitle>Issued To</CardTitle>
            <CardBody>
              <DataList aria-label="Issued To Data List" isCompact>
                <DataListItem aria-labelledby="CNB">
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="primary content">
                          <span id="CNB"><b>Common Name</b></span>
                        </DataListCell>,
                        <DataListCell key="secondary content">{issuedByObject["CN"]}</DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
                <DataListItem aria-labelledby="OB">
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="primary content">
                          <span id="OB"><b>Organization</b></span>
                        </DataListCell>,
                        <DataListCell key="secondary content">{issuedByObject["O"]}</DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
                <DataListItem aria-labelledby="OUB">
                  <DataListItemRow>
                    <DataListItemCells
                      dataListCells={[
                        <DataListCell key="primary content">
                          <span id="OUB"><b>Organizational Unit</b></span>
                        </DataListCell>,
                        <DataListCell key="secondary content">{issuedByObject["OU"]}</DataListCell>
                      ]}
                    />
                  </DataListItemRow>
                </DataListItem>
              </DataList>
            </CardBody>
          </Card>
        </StackItem>
        <StackItem>
        <Card isCompact>
          <CardTitle>Issued By</CardTitle>
          <CardBody>
            <DataList aria-label="Issued By Data List" isCompact>
              <DataListItem aria-labelledby="CN">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="CN"><b>Common Name</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["CN"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="O">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="O"><b>Organization</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["O"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="OU">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="OU"><b>Organizational Unit</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["OU"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="C">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="C"><b>Country</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{issuedToObject["C"]}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="SN">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="SN"><b>Serial Number</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{cert.serialNumber}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </DataList>
          </CardBody>
        </Card>
        </StackItem>
        <StackItem>
        <Card isCompact>
          <CardTitle>Validity</CardTitle>
          <CardBody>
            <DataList aria-label="Validity Data List" isCompact>
              <DataListItem aria-labelledby="NotBefore">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="NotBefore"><b>Issued On</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{cert.notBefore.toLocaleString()}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="NotAfter">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="NotAfter"><b>Expires On</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{cert.notAfter.toLocaleString()}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </DataList>
          </CardBody>
        </Card>
        </StackItem>
        <StackItem>
        <Card isCompact>
          <CardTitle>Validity</CardTitle>
          <CardBody>
            <DataList aria-label="Fingerprint Data List" isCompact>
              <DataListItem aria-labelledby="PUBKEY">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="PUBKEY"><b>Public Key</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{pubKey}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
              <DataListItem aria-labelledby="SHA">
                <DataListItemRow>
                  <DataListItemCells
                    dataListCells={[
                      <DataListCell key="primary content">
                        <span id="SHA"><b>{cert.signatureAlgorithm.hash.name} Signature</b></span>
                      </DataListCell>,
                      <DataListCell key="secondary content">{signature}</DataListCell>
                    ]}
                  />
                </DataListItemRow>
              </DataListItem>
            </DataList>
          </CardBody>
        </Card>
        </StackItem>
        </Stack>}

        </Modal>

      </React.Fragment>
    );
  }
}

export { ViewCertModal };
