import { Card, CardBody } from "@windmill/react-ui";

interface IInfoCard {
  title: string;
  value: string;
  children?: React.ReactNode;
}

function InfoCard({ title, value, children }: IInfoCard) {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardBody className="flex items-center">
        {children}
        <div>
          <p className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            {value}
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

export default InfoCard;
