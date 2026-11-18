import { getMyFavoritesAction } from "@/features/actions/private/favorites/get-my-favorites"

export const MyFavoritesReults = async () => {

    const {totalPages} = await getMyFavoritesAction()

    return (
        <div>MyFavoritesReults</div>
    )
}
