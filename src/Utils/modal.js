import React from "react";
import ee from "event-emitter"

const emitter = new ee();

export const modalify = (title, msg, type, handleCallback) => {
    emitter.emit('modal', title, msg, type, handleCallback)
};

class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            title: '',
            msg: '',
            type: '',

        };
        this.timeout = null;

        emitter.on('modal', (title, msg, type,handleCallback) => {
            this.handleCallback=handleCallback
            this.showModal(title,msg, type);
        });
    }
    handleCallback= ()=>{};
    showModal = (title, msg, type) => {

        this.setState({
            show: !this.state.show,
            title: title,
            msg: msg,
            type: type,
        }, () => {
            this.timeout = setTimeout(() => {
                this.setState({top: -100})
            }, 5000)
        });
    };
    handleDismiss = ()=> {
        this.setState({
            show: !this.state.show,
        }, () => {
            this.timeout = setTimeout(() => {
                this.setState({top: 100})
            }, 5000)
        });
    }
    handleConfirm = (e)=> {
        //emitter.emit('confirm')
        this.handleDismiss()
        this.handleCallback(e)
    }
    render() {


        return (
            <div id="modal1" className="modal modal-sm open" style={(this.state.show)?{width:"35%",zIndex: 1003, display: "block", opacity: 1, top: "20%", transform: "scaleX(1) scaleY(1)"}:{}}>
                <div className="modal-content">
                    <h5 className="red-text">{this.state.title}</h5>
                    <p>{this.state.msg}</p>
                </div>
                <div className="modal-footer">
                    <button className="modal-close waves-effect waves-red btn-flat red-text red lighten-4" onClick={(e)=> this.handleConfirm(e)}>Oui</button> &nbsp;
                    <button className="modal-close waves-effect waves-blue btn-flat red-text  white" onClick={(e)=> this.handleDismiss(e)}>Non</button>&nbsp;
                </div>
            </div>
        )
    }
};
export default Modal;