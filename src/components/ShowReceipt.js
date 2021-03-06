import React from "react"
import {
	StyleSheet,
	TouchableOpacity,
	Text,
	Linking,
	Alert,
	View
} from "react-native"
import { strings } from "../i18n"
import { colors } from "../consts"
import { fetchOrError } from "../actions/utils"
import { getRole } from "../actions/auth"

export default class ShowReceipt extends React.Component {
	constructor(props) {
		super(props)
		this.state = { pdf_link: "" }
	}

	_showReceipt = () => {
		Linking.openURL(this.props.item.pdf_link || this.state.pdf_link)
	}

	_clickToCreateReceipt() {
		// are you sure stage
		Alert.alert(
			strings("are_you_sure"),
			strings("teacher.are_you_sure_invoice"),
			[
				{
					text: strings("cancel"),
					style: "cancel"
				},
				{
					text: strings("ok"),
					onPress: this._createReceipt.bind(this)
				}
			]
		)
	}

	async _createReceipt() {
		const resp = await this.props.dispatch(
			fetchOrError(`/teacher/payments/${this.props.item.id}/receipt`, {
				method: "GET"
			})
		)
		if (resp) {
			this.setState({ pdf_link: resp.json["pdf_link"] }, () => {
				Alert.alert(
					strings("teacher.receipt_created_title"),
					strings("teacher.receipt_created_msg", {
						student: this.props.item.student.name
					}),
					[
						{
							text: strings("show_receipt_later")
						},
						{
							text: strings("show_receipt"),
							onPress: () => this._showReceipt(),
							style: "cancel"
						}
					],
					{ cancelable: false }
				)
			})
		}
	}

	render() {
		if (this.props.item.pdf_link || this.state.pdf_link) {
			return (
				<TouchableOpacity
					onPress={this._showReceipt.bind(this)}
					style={this.props.style}
				>
					<Text style={styles.receipt}>
						{strings("show_receipt")}
					</Text>
				</TouchableOpacity>
			)
		} else {
			if (getRole(this.props.user) == "teacher") {
				return (
					<TouchableOpacity
						onPress={this._clickToCreateReceipt.bind(this)}
						style={this.props.style}
					>
						<Text style={styles.receipt}>
							{strings("teacher.create_receipt")}
						</Text>
					</TouchableOpacity>
				)
			}
		}
		return <View />
	}
}

const styles = StyleSheet.create({
	receipt: {
		color: colors.blue,
		fontWeight: "bold",
		alignSelf: "flex-start"
	}
})
