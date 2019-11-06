const MiniCssExtractPlugin = require('mini-css-extract-plugin') //抽离css样式为单独文件
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin')
const { smart } = require('webpack-merge')
const webpack = require('webpack')
const path = require('path')
const os = require('os')
const Happypack = require('happypack')
const happyThreadPool = Happypack.ThreadPool({ size: os.cpus().length })
const base = require('./webpack.base.js')
const getLocalIp = require('./scripts/getLocalIp')
const IP = getLocalIp()
const port = 3456

module.exports = smart(base, {
	mode: 'development',
	devtool: 'source-map', //增加映射文件 可以帮助我们调试源代码
	devServer: {
		clientLogLevel: 'none', //关闭webpack控制台输出
		quiet: true,
		hot: true, //启用热更新
		contentBase: './dist', //devServer如果不指定contentBase,默认会在根目录下起一个静态资源服务器,显示文件目录
		host: IP,
		port,
		progress: true,
		open: true,
		compress: true, // 是否压缩
		proxy: {
			'/api': {
				target: 'http://localhost:8080',
				pathRewrite: { '/api': '' }
			}
		},
		//mock接口
		before(app) {
			app.get('/user', (req, res) => {
				res.json({
					name: 'study-webpack'
				})
			})
		}
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/, // 加快编译速度，不包含node_modules文件夹内容
				include: path.resolve(__dirname, './src'),
				use: 'happypack/loader?id=js'
			},
			{
				test: /\.css$/,
				include: /node_modules/,
				use: [MiniCssExtractPlugin.loader, 'css-loader']
			},
			{
				test: /\.css$/,
				exclude: /node_modules/,
				use: 'happypack/loader?id=css'
			},
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: 'happypack/loader?id=scss'
			},
			{
				test: /\.less$/,
				exclude: /node_modules/,
				use: 'happypack/loader?id=less'
			},
			{
				test: /\.(jpg|png|gif|svg)$/,
				use: {
					loader: 'url-loader',
					options: {
						limit: 8192,
						outputPath: 'image'
					}
				}
			}
		]
	},
	plugins: [
		new MiniCssExtractPlugin({ filename: 'main.css' }),
		new FriendlyErrorsWebpackPlugin({
			compilationSuccessInfo: {
				messages: [`App is running at: http://${IP}:${port}/`]
			}
		}),
		new webpack.NamedModulesPlugin(), //打印更新的模块路径
		new webpack.HotModuleReplacementPlugin(), //热更新插件
		new Happypack({
			id: 'js',
			threadPool: happyThreadPool,
			loaders: ['babel-loader']
		}),
		new Happypack({
			id: 'css',
			threadPool: happyThreadPool,
			loaders: ['style-loader', { loader: 'css-loader', options: { modules: true } }, 'postcss-loader']
		}),
		new Happypack({
			id: 'less',
			threadPool: happyThreadPool,
			loaders: [
				'style-loader',
				{ loader: 'css-loader', options: { modules: true } },
				'postcss-loader',
				{ loader: 'less-loader', options: { javascriptEnabled: true } }
			]
		}),
		new Happypack({
			id: 'scss',
			threadPool: happyThreadPool,
			loaders: [
				'style-loader',
				{ loader: 'css-loader', options: { modules: true } },
				'postcss-loader',
				'sass-loader'
			]
		})
	]
	// watch: true, //实时打包
	// watchOptions: {
	// 	poll: 1000, //每秒监控多少次
	// 	aggreatement: 500, //输入防抖
	// 	ignored: /node_moudles/ //不需要监控哪个文件
	// },
})
