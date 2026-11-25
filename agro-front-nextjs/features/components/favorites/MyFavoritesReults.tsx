import { getMyFavoritesAction } from "@/features/actions/private/favorites/get-my-favorites"
import { ListingsGrid } from "../listings/ListingsGrid"
import { PaginationApp } from "../global/pagination/Pagination-App"

export const MyFavoritesReults = async () => {

    const {items, totalPages} = await getMyFavoritesAction()

    return (
        <div className="space-y-4">
            <ListingsGrid listings={items} />
            
            <PaginationApp totalPages={totalPages} />
        </div>
    )
}
