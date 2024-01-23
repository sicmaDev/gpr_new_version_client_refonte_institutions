import { useToasts } from 'react-toast-notifications'



export const Alert = (message, type) => {
    let { addToast } = useToasts();
    // useEffect(() => {
    //     Alert("message", "success")
    //
    // }, []);
    addToast(message, {
        appearance: type,
        autoDismiss: true,
    })

}