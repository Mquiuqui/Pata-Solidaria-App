import { Button } from "@/components/Button"
import { storage } from "@/services/storage"
import { useRouter } from "expo-router"
import { useEffect } from "react"
import { StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function PerfilScreen() {
    const router = useRouter()

    useEffect(() => {
        storage.getUser().then((user: unknown) => {
            if ((user as { anonimo?: boolean })?.anonimo) {
                router.replace("/home")
            }
        })
    }, [router])

    const handleLogout = async () => {
        await storage.clear()
        router.replace("/login")
    }

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <View style={styles.content}>
                <Text style={styles.title}>Perfil</Text>
                <Text style={styles.subtitle}>
                    Aqui estarão suas informações e configurações.
                </Text>
                <Button label="Sair" onPress={handleLogout} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F2F1FA",
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#15104D",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: "#6B6B6B",
        textAlign: "center",
        marginBottom: 32,
    },
})
