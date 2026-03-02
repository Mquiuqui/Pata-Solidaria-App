import { Button } from "@/components/Button"
import { api } from "@/services/api"
import type { UsuarioDto } from "@/services/api"
import { storage } from "@/services/storage"
import { getBase64ImageUri } from "@/utils/image"
import { Feather } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useRouter } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

const PRIMARY = "#15104D"
const BG = "#EAEAF2"

export default function PerfilScreen() {
    const router = useRouter()
    const [user, setUser] = useState<UsuarioDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [nome, setNome] = useState("")
    const [email, setEmail] = useState("")
    const [sobreMim, setSobreMim] = useState("")
    const [fotoPerfil, setFotoPerfil] = useState<string | null>(null)

    const loadPerfil = useCallback(async () => {
        const token = await storage.getToken()
        const u = await storage.getUser()
        if (!token || !u || typeof u !== "object" || (u as { isAnonimo?: boolean })?.isAnonimo) {
            router.replace("/home")
            return
        }
        setLoading(true)
        try {
            const perfil = await api.obterPerfil(token)
            setUser(perfil)
            setNome(perfil.nome || "")
            setEmail(perfil.email || "")
            setSobreMim(perfil.sobreMim ?? "")
            setFotoPerfil(perfil.fotoPerfil ?? null)
        } catch {
            setUser(u as UsuarioDto)
            setNome((u as UsuarioDto).nome || "")
            setEmail((u as UsuarioDto).email || "")
            setSobreMim((u as UsuarioDto).sobreMim ?? "")
            setFotoPerfil((u as UsuarioDto).fotoPerfil ?? null)
        } finally {
            setLoading(false)
        }
    }, [router])

    useEffect(() => {
        loadPerfil()
    }, [loadPerfil])

    const handleSave = async () => {
        if (!user) return
        const token = await storage.getToken()
        if (!token) return
        const nomeTrim = nome.trim()
        const emailTrim = email.trim()
        if (!nomeTrim || !emailTrim) {
            Alert.alert("Erro", "Nome e e-mail são obrigatórios")
            return
        }
        setSaving(true)
        try {
            await api.atualizarPerfil(token, {
                nome: nomeTrim,
                email: emailTrim,
                sobreMim: sobreMim.trim() || null,
                fotoPerfil: fotoPerfil || null,
            })
            const atualizado: UsuarioDto = {
                ...user,
                nome: nomeTrim,
                email: emailTrim,
                sobreMim: sobreMim.trim() || null,
                fotoPerfil: fotoPerfil || null,
            }
            setUser(atualizado)
            await storage.saveUser(atualizado)
            setIsEditing(false)
            Alert.alert("Sucesso", "Perfil atualizado")
        } catch (e: unknown) {
            Alert.alert("Erro", e instanceof Error ? e.message : "Erro ao salvar")
        } finally {
            setSaving(false)
        }
    }

    const pickPhoto = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
        if (status !== "granted") {
            Alert.alert("Permissão", "É necessário permitir acesso à galeria para alterar a foto.")
            return
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
            base64: true,
        })
        if (!result.canceled && result.assets[0]?.base64) {
            const uri = `data:image/jpeg;base64,${result.assets[0].base64}`
            setFotoPerfil(uri)
        }
    }

    const handleLogout = async () => {
        await storage.clear()
        router.replace("/login")
    }

    if (loading && !user) return null

    const photoUri = getBase64ImageUri(isEditing ? fotoPerfil : (user?.fotoPerfil ?? fotoPerfil))

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.imageContainer}>
                    {photoUri ? (
                        <Image
                            source={{ uri: photoUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    ) : (
                        <Image
                            source={require("@/assets/homem-com-seu-cão-que-joga-no-parque.png")}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )}
                    <TouchableOpacity
                        style={[styles.floatingButton, styles.leftButton]}
                        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        {saving ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Feather
                                name={isEditing ? "check" : "edit"}
                                size={20}
                                color="#fff"
                            />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.floatingButton, styles.rightButton]}
                        onPress={isEditing ? pickPhoto : undefined}
                        activeOpacity={0.8}
                    >
                        <Feather
                            name={isEditing ? "camera" : "arrow-down"}
                            size={20}
                            color="#fff"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    {isEditing ? (
                        <>
                            <Text style={styles.label}>Nome</Text>
                            <TextInput
                                style={styles.input}
                                value={nome}
                                onChangeText={setNome}
                                placeholder="Seu nome"
                                placeholderTextColor="#999"
                                editable={!saving}
                            />
                            <Text style={styles.label}>E-mail</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="seu@email.com"
                                placeholderTextColor="#999"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                editable={!saving}
                            />
                        </>
                    ) : (
                        <Text style={styles.name}>{user?.nome || "Usuário"}</Text>
                    )}

                    <Text style={styles.label}>Sobre mim</Text>
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, styles.inputMultiline]}
                            value={sobreMim}
                            onChangeText={setSobreMim}
                            placeholder="Conte um pouco sobre você"
                            placeholderTextColor="#999"
                            multiline
                            numberOfLines={3}
                            editable={!saving}
                        />
                    ) : (
                        <Text style={styles.text}>
                            {user?.sobreMim?.trim() || "Olá!"}
                        </Text>
                    )}

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Perfil</Text>
                    </View>

                    <Text style={styles.label}>Contato</Text>
                    <Text style={styles.text}>
                        {user?.telefone || user?.email || "—"}
                    </Text>

                    <View style={styles.logoutWrap}>
                        <Button label="Sair" onPress={handleLogout} disabled={saving} />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BG,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        width: "100%",
        height: 280,
        backgroundColor: "#ddd",
    },
    floatingButton: {
        position: "absolute",
        bottom: -25,
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: PRIMARY,
        justifyContent: "center",
        alignItems: "center",
    },
    leftButton: {
        left: 20,
    },
    rightButton: {
        right: 20,
    },
    content: {
        marginTop: 40,
        paddingHorizontal: 20,
    },
    name: {
        fontSize: 28,
        fontWeight: "bold",
        color: PRIMARY,
        marginBottom: 20,
    },
    label: {
        fontWeight: "bold",
        marginTop: 15,
        marginBottom: 5,
        color: PRIMARY,
    },
    text: {
        fontSize: 16,
        color: "#333",
    },
    input: {
        backgroundColor: "#F4F4F4",
        borderRadius: 10,
        padding: 12,
        borderWidth: 1,
        borderColor: "#DDD",
        fontSize: 16,
    },
    inputMultiline: {
        minHeight: 80,
        textAlignVertical: "top",
    },
    badge: {
        marginTop: 10,
        alignSelf: "flex-start",
        backgroundColor: "#E8E4F0",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: PRIMARY,
        fontWeight: "600",
    },
    logoutWrap: {
        marginTop: 32,
    },
})
