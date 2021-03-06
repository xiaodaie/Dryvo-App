import React from "react"
import {
	View,
	StyleSheet,
	TouchableOpacity,
	FlatList,
	Platform,
	KeyboardAvoidingView,
	ScrollView
} from "react-native"
import { connect } from "react-redux"
import { strings } from "../../i18n"
import Row from "../../components/Row"
import UserWithPic from "../../components/UserWithPic"
import Separator from "../../components/Separator"
import { SearchBar, Icon } from "react-native-elements"
import PageTitle from "../../components/PageTitle"
import { MAIN_PADDING } from "../../consts"
import { getStudents } from "../../actions/students"
import { NavigationActions } from "react-navigation"
import EmptyState from "../../components/EmptyState"
import StudentsLoader from "../../components/StudentsLoader"

export class AddPaymentChooseStudent extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			search: "",
			student: {},
			students: [],
			page: 1,
			nextUrl: "",
			loading: true
		}

		this.renderItem = this.renderItem.bind(this)
		this._getStudents()
	}

	updateSearch = search => {
		this.setState({ search, loading: true }, () => {
			this._getStudents(false)
		})
	}

	_getStudents = async (append = true) => {
		resp = await getStudents(this.props.fetchService, this.state)
		let newValue = resp.students
		if (append) {
			newValue = [...this.state.students, ...newValue]
		}
		this.setState({
			students: newValue,
			nextUrl: resp.nextUrl,
			loading: false
		})
	}

	endReached = () => {
		if (!this.state.nextUrl) return
		this.setState(
			{
				page: this.state.page + 1,
				nextUrl: ""
			},
			() => {
				this._getStudents()
			}
		)
	}

	onPress = item => {
		this.setState(
			{
				student: item
			},
			() => {
				this.props.navigation.navigate("Second", { student: item })
			}
		)
	}

	renderItem = ({ item, index }) => {
		let noneMargin = {}
		if (index == 0) {
			noneMargin = { marginTop: 0 }
		}
		return (
			<TouchableOpacity
				key={`student${item.student_id}`}
				onPress={() => this.onPress(item)}
			>
				<Row
					leftSide={
						<View style={styles.addButton}>
							<Icon name="ios-add" type="ionicon" color="#000" />
						</View>
					}
					style={{ ...styles.row, ...noneMargin }}
				>
					<UserWithPic
						user={item}
						nameStyle={styles.nameStyle}
						width={64}
						height={64}
					/>
				</Row>
			</TouchableOpacity>
		)
	}

	_renderEmpty = () => (
		<EmptyState
			image="students"
			text={strings("empty_students")}
			style={styles.empty}
		/>
	)

	_renderStudents = () => {
		if (this.state.loading) {
			return (
				<View style={styles.listLoader}>
					<StudentsLoader />
				</View>
			)
		}
		return (
			<FlatList
				data={this.state.students}
				renderItem={this.renderItem}
				keyExtractor={item => `student${item.student_id}`}
				onEndReached={this.endReached}
				keyboardDismissMode={
					Platform.OS === "ios" ? "interactive" : "on-drag"
				}
				keyboardShouldPersistTaps="handled"
				ListEmptyComponent={this._renderEmpty}
				style={{ flex: 1 }}
			/>
		)
	}
	render() {
		return (
			<View style={styles.container}>
				<PageTitle
					style={styles.title}
					title={strings("teacher.add_payment.title1")}
					leftSide={
						<TouchableOpacity
							onPress={() => {
								this.props.navigation.dispatch(
									NavigationActions.back()
								)
							}}
							style={styles.closeButton}
						>
							<Icon name="ios-close" type="ionicon" size={36} />
						</TouchableOpacity>
					}
				/>
				<View
					style={styles.studentsSearchView}
					testID="StudentsSearchView"
				>
					<KeyboardAvoidingView
						behavior={Platform.OS === "ios" ? "padding" : null}
						keyboardVerticalOffset={
							Platform.OS === "ios" ? 100 : null
						}
						style={{ flex: 1 }}
					>
						<SearchBar
							placeholder={strings("teacher.students.search")}
							onChangeText={this.updateSearch}
							value={this.state.search}
							platform="ios"
							containerStyle={styles.searchBarContainer}
							inputContainerStyle={styles.inputContainerStyle}
							cancelButtonTitle={strings(
								"teacher.students.cancel"
							)}
							inputStyle={styles.search}
							textAlign="right"
							autoFocus={true}
							testID="searchBar"
						/>
						<Separator />
						{this._renderStudents()}
					</KeyboardAvoidingView>
				</View>
			</View>
		)
	}
}

function mapStateToProps(state) {
	return {
		fetchService: state.fetchService
	}
}

export default connect(mapStateToProps)(AddPaymentChooseStudent)

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginLeft: MAIN_PADDING,
		marginRight: MAIN_PADDING,
		marginTop: 20
	},
	studentsSearchView: { paddingTop: 0, flex: 1 },
	searchBarContainer: {
		backgroundColor: "transparent",
		paddingBottom: 0,
		paddingTop: 0,
		marginTop: 16
	},
	inputContainerStyle: {
		borderRadius: 30,
		paddingLeft: 8,
		paddingTop: 6,
		paddingBottom: 6,
		width: "100%",
		marginLeft: 0,
		marginRight: 0
	},
	search: {
		alignItems: "flex-start",
		paddingLeft: 6,
		fontSize: 14,
		marginLeft: 0
	},
	nameStyle: {
		fontSize: 18,
		marginTop: 14
	},
	addButton: {
		marginTop: 12
	},
	row: { marginTop: 20 },
	closeButton: {
		marginTop: Platform.select({ ios: -6, android: -12 })
	}
})
