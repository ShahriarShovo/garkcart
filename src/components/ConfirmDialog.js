import React from 'react';

const ConfirmDialog = ({show, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel"}) => {
    if(!show) return null;

    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
                <div className="confirm-dialog-header">
                    <h5 className="confirm-dialog-title">{title}</h5>
                </div>
                <div className="confirm-dialog-body">
                    <p className="confirm-dialog-message">{message}</p>
                </div>
                <div className="confirm-dialog-footer">
                    <button
                        className="btn btn-secondary confirm-dialog-cancel"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        className="btn btn-danger confirm-dialog-confirm"
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
