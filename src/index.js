import dva from 'dva'
import createLoading from 'dva-loading'
import router from './router'
// 1. Initialize
const app = dva()

// 2. Plugins
app.use(createLoading())

// 3. Model
// app.model(require('./models/example').default);

// 4. Router
app.router(router)

// 5. Start
app.start('#root')
