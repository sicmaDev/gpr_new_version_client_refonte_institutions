import React, { Component } from 'react';
import styled from "styled-components"
import ee from "event-emitter"


const Container = styled.div`
  padding: 16px;
  position:fixed;
  top: ${props => props.top}px;
  right: 16px;
  z-index: 999999999999;
  transition: top 0.5s ease;
`;


const emitter = new ee();

export const notify = (msg, type) => {
    emitter.emit('notification', msg, type)
};

class Alert extends Component {
    constructor(props) {
        super(props);
        this.state = {
            top: -100,
            msg: '',
            type: '',
        };
        this.timeout = null;

        emitter.on('notification', (msg, type) => {
            this.onShow(msg, type);
        });
    }
    // componentDidMount() {
    //     this.onShow();
    //     this.showNotification();
    // }
   
    // componentWillUnmount() {
    //     clearTimeout(this.timeout);
    // }

    onShow = (msg, type) => {
        if (this.timeout) {
            clearTimeout(this.timeout)
            this.setState({top: -100}, () => {
                this.timeout = setTimeout(() => {
                    this.showNotification(msg, type);
                }, 500)
            })
        }
        else {
            this.showNotification(msg, type);
        }
    };
    showNotification = (msg, type) => {

        this.setState({
            top: 16,
            msg: msg,
            type: type
        }, () => {
            this.timeout = setTimeout(() => {
                this.setState({top: -100})
            }, 5000)
        });
    };

    render() {
        // const { classes } = this.props;
        let colorPrimary = "";
        let colorSecondary = "";
        let backgroundColorPrimary = "";
        let backgroundColorSecondary = "";
        let svg = "";
        switch(this.state.type){
            case "error":
                colorPrimary = "rgb(191, 38, 0)";
                colorSecondary = "rgb(255, 235, 230)";
                backgroundColorPrimary = "rgb(255, 235, 230)";
                backgroundColorSecondary = "rgb(255, 86, 48)";
                svg = (<svg aria-hidden="true" height="16" width="12" viewBox="0 0 12 16" className="react-toast-notifications__toast__icon css-rqgsqp" style={{display: 'inline-block', verticalAlign: 'text-top', fill: 'currentcolor'}}><path fillRule="evenodd" d="M5.05.01c.81 2.17.41 3.38-.52 4.31C3.55 5.37 1.98 6.15.9 7.68c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.01 8.68 2.15 5.05.02L5.03 0l.02.01z"></path></svg>);
                break;
            case "warning":
                colorPrimary = "rgb(255, 139, 0)";
                colorSecondary = "rgb(255, 235, 230)";
                backgroundColorPrimary = "rgb(255, 250, 230)";
                backgroundColorSecondary = "rgb(255, 171, 0)";
                svg = (<svg aria-hidden="true" height="16" width="16" viewBox="0 0 16 16" className="react-toast-notifications__toast__icon css-rqgsqp" style={{display: 'inline-block', verticalAlign: 'text-top', fill: 'currentcolor'}}><path fillRule="evenodd" d="M8.893 1.5c-.183-.31-.52-.5-.887-.5s-.703.19-.886.5L.138 13.499a.98.98 0 0 0 0 1.001c.193.31.53.501.886.501h13.964c.367 0 .704-.19.877-.5a1.03 1.03 0 0 0 .01-1.002L8.893 1.5zm.133 11.497H6.987v-2.003h2.039v2.003zm0-3.004H6.987V5.987h2.039v4.006z"></path></svg>)
                break;
            case "success":
                colorPrimary = "rgb(0, 102, 68)";
                colorSecondary = "rgb(255, 235, 230)";
                backgroundColorPrimary = "rgb(227, 252, 239)";
                backgroundColorSecondary = "rgb(54, 179, 126)";
                svg = (<svg aria-hidden="true" height="16" width="12" viewBox="0 0 12 16" className="react-toast-notifications__toast__icon css-rqgsqp" style={{display: 'inline-block', verticalAlign: 'text-top', fill: 'currentcolor'}}><path fillRule="evenodd" d="M12 5.5l-8 8-4-4L1.5 8 4 10.5 10.5 4 12 5.5z"></path></svg>);
                break;
            case "info":
                colorPrimary = "rgb(80, 95, 121)";
                colorSecondary = "rgb(227, 252, 239)";
                backgroundColorPrimary = "white";
                backgroundColorSecondary = "rgb(38, 132, 255)";
                svg = (<svg aria-hidden="true" height="16" width="14" viewBox="0 0 14 16" className="react-toast-notifications__toast__icon css-rqgsqp" style={{display: 'inline-block', verticalAlign: 'text-top', fill: 'currentcolor'}}><path fillRule="evenodd" d="M6.3 5.71a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 8.01c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V8v.01zM7 2.32C3.86 2.32 1.3 4.86 1.3 8c0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 1c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"></path></svg>)
                break;
        }
        let containerStyle = {
            boxSizing: "border-box",
            maxHeight: "100%",
            overflowX: "hidden",
            overflowY: "auto",
            zIndex: "2599",
            padding: "8px",
            fontSize:"15px"
        };
        let wrapperStyle = {
            backgroundColor: backgroundColorPrimary,
            boxShadow: "rgba(0, 0, 0, 0.176) 0px 3px 8px",
            color: colorPrimary,
            display: "flex",
            marginBottom: "8px",
            width: "360px",
            transform: "translate3d(0px, 0px, 0px)",
            borderRadius: "4px",
            transition: "transform 220ms cubic-bezier(0.2, 0, 0, 1) 0s, opacity 220ms ease 0s"
        };
        let iconWrapperStyle = {
            backgroundColor: backgroundColorSecondary,
            borderTopLeftRadius: "4px",
            borderBottomLeftRadius: "4px",
            color: colorSecondary,
            flexShrink: 0,
            paddingBottom: "8px",
            paddingTop: "8px",
            position: "relative",
            textAlign: "center",
            width: "30px",
            overflow: "hidden"
        };
        let contentWrapperStyle = {
            WebkitBoxFlex: 1,
            flexGrow: 1,
            fontSize: "0.8em",
            lineHeight: 1.4,
            minHeight: "40px",
            padding: "8px 12px",
        };

        return (
                <Container top={this.state.top} className="react-toast-notifications__container css-3y3n1b"
                           style={containerStyle}>
                    <div className="css-h2fnfe" style={{height: "64px", transition: "height 120ms ease 100ms"}}>
                        <div
                            className="react-toast-notifications__toast react-toast-notifications__toast--error css-bp9fl6"
                            style={wrapperStyle}>
                            <div className="react-toast-notifications__toast__icon-wrapper css-tpnslk"
                                style={iconWrapperStyle}>
                                <div className="react-toast-notifications__toast__countdown css-1hhjn03"></div>
                                {svg}
                            </div>
                            <div className="react-toast-notifications__toast__content css-1ad3zal"
                                 style={contentWrapperStyle}>{this.state.msg}
                            </div>
                            <div role="button" className="react-toast-notifications__toast__dismiss-button css-4hd0gx"
                                 style={{
                                     cursor: "pointer",
                                     flexShrink: 0,
                                     opacity: 0.5,
                                     padding: "8px 12px",
                                     transition: "opacity 150ms ease 0s",
                                 }}>
                                <svg aria-hidden="true" height="16" width="14" viewBox="0 0 14 16"
                                     className="react-toast-notifications__toast__dismiss-icon"
                                     style={{display: "inline-block", verticalAlign: "text-top", fill: "currentcolor"}}>
                                    <path fillRule="evenodd"
                                          d="M7.71 8.23l3.75 3.75-1.48 1.48-3.75-3.75-3.75 3.75L1 11.98l3.75-3.75L1 4.48 2.48 3l3.75 3.75L9.98 3l1.48 1.48-3.75 3.75z"></path>
                                </svg>
                                <span className="react-toast-notifications__toast__dismiss-text css-1uvvha"
                                      style={{
                                          clip: "rect(1px, 1px, 1px, 1px)",
                                          height: "1px",
                                          position: "absolute",
                                          whiteSpace: "nowrap",
                                          width: "1px",
                                          borderWidth: "0px",
                                          borderStyle: "initial",
                                          borderColor: "initial",
                                          borderImage: "initial",
                                          overflow: "hidden",
                                          padding: "0px"
                                      }}>Close</span>
                            </div>
                        </div>
                    </div>
                </Container>
        )
    }


};
export default Alert;
