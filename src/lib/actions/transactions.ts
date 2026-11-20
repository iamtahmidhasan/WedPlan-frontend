

export const transactionVerify = async(session_id: string)=>{
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/verify`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({ session_id })
    })
    return res.json()
}