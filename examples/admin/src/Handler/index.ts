import DefaultHandler from './default'
import ServerHandler from './ServerHandler'
import RouterHandler from './RouterHandler'
import SchemaHandler from './SchemaHandler'
export default[
    ...DefaultHandler,
    ...ServerHandler,
    ...RouterHandler,
    ...SchemaHandler
]