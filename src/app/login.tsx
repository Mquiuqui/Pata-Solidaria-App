import { Button } from "@/components/Button"
import { Input } from "@/components/Input"
import { api } from "@/services/api"
import { storage } from "@/services/storage"
import { Link, useRouter } from "expo-router"
import { useState } from "react"
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from "react-native"

export default function Login(){
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")
    const [loading, setLoading] = useState(false)

    const handleLogin = async () => {
        if (!email.trim() || !senha.trim()) {
            Alert.alert("Erro", "Por favor, preencha todos os campos")
            return
        }

        setLoading(true)
        try {
            const response = await api.login({ email, senha })
            
            if (response.sucesso && response.token) {
                await storage.saveToken(response.token)
                if (response.usuario) {
                    await storage.saveUser(response.usuario)
                }
                Alert.alert("Sucesso", response.mensagem)
                router.replace("/home")
            }
        } catch (error: any) {
            Alert.alert("Erro", error.message || "Erro ao fazer login")
        } finally {
            setLoading(false)
        }
    }

    const handleEntradaRapida = () => {
        router.push("/anonymouslogin")
    }

    return(
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.select({ios: "padding",android:"height"})}>
        <ScrollView 
        contentContainerStyle ={{flexGrow: 1}} keyboardShouldPersistTaps="handled">
     <View style={style.container }>
        <Image
        source={require("@/assets/pata.png")}
        style={style.ilustration}
       />

       <Text style ={style.title}>Bem Vindo</Text>

       <View style={style.form}>
         <Input 
            placeholder="E-mail" 
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!loading}
         />
         <Input 
            placeholder="Senha" 
            secureTextEntry
            value={senha}
            onChangeText={setSenha}
            editable={!loading}
         />
          <Text style ={style.subtitle}>Esqueceu a senha?{"  "}
            <Link href="/signup" style= {style.footerLink} >
            Crie uma nova senha aqui
            </Link>
            </Text>
         <Button 
            label={loading ? "Entrando..." : "Entrar"} 
            onPress={handleLogin}
            disabled={loading}
         />
         {loading && <ActivityIndicator size="small" color="#15104D" style={{marginTop: 10}} />}
         <Button 
            label={"Entrada Rápida"} 
            onPress={handleEntradaRapida}
            disabled={loading}
         />
       </View>

       <Text style ={style.footerText}>
        Ainda não possui uma conta? {"  "}
        <Link href="/anonymouslogin" style= {style.footerLink} >
        Crie aqui.</Link> 
        </Text>
       </View>
       </ScrollView>
       </KeyboardAvoidingView>
    )
}

const style = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: "#F2F1FA",
        padding:32,

    },
    ilustration: {
        alignSelf: "center",
        width: "50%",
        height: 330,
        resizeMode: "contain",
        marginTop: 62
    },
    title: {
        fontSize: 32,
        fontWeight: 900,
         color:"#15104D",
    },
       subtitle: {
        color: "#15104D",
        fontSize: 16,

    },
    form:{
        marginTop:24,
        gap: 18,
    },
    footerText:{
        textAlign: "center",
        marginTop:24,
        color:"#000000"
    },
    footerLink:{
        color:"#15104D",
        fontWeight: 700,
    },
})