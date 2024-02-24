import { InputTypes } from "./types"

export const getInputType = (): InputTypes => {
    return localStorage.getItem('inputType') as InputTypes || InputTypes.stick
}