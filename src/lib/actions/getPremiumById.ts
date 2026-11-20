export const getPremiumById = async ({userId}: {userId: string}) => {     
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${userId}/premium`)
    const data = await res.json()
    return data

}