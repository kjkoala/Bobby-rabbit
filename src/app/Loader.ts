import { Loader } from 'excalibur'
import { resources } from './resources'


export const loader = new Loader()

loader.addResources(Object.values(resources))