import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps } from "react-native";

type ButtonProps = TouchableOpacityProps & {
    label : string
}

export function Button({label, disabled, ... rest}: ButtonProps){
    return(
        <TouchableOpacity 
            style={[styles.container, disabled && styles.containerDisabled]} 
            activeOpacity={0.8}
            disabled={disabled}
            {...rest}
        >
            <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container:{
        marginTop: 10,
        width: "100%",
        height: 48,
        backgroundColor: "#15104D",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 20
    },
    containerDisabled: {
        backgroundColor: "#9E9E9E",
        opacity: 0.6
    },
    label: {
        color:"#FFFF",
        fontSize: 16,
        fontWeight: "600",
    },
    labelDisabled: {
        color: "#E0E0E0"
    }
})

