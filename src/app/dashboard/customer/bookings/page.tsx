import BookingsContent from "./bookings-content";
type Props = {

    searchParams: {
        canceled?: string;
    };
};

export default function BookingsPage({ searchParams }: Props) {
    return <BookingsContent searchParams={searchParams} />;
}
