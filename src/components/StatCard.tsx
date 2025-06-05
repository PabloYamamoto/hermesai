import React from 'react';
import { Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'default';
    change?: {
        value: number;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon,
    color = 'primary',
    change
}) => {
    return (
        <Card className="document-card-transition">
            <CardBody>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-small text-default-500">{title}</p>
                        <p className="text-2xl font-semibold mt-1">{value}</p>

                        {change && (
                            <div className="flex items-center mt-2">
                                <Icon
                                    icon={change.isPositive ? "lucide:trending-up" : "lucide:trending-down"}
                                    className={change.isPositive ? "text-success" : "text-danger"}
                                    width={16}
                                />
                                <span
                                    className={`text-xs ml-1 ${change.isPositive ? "text-success" : "text-danger"
                                        }`}
                                >
                                    {change.isPositive ? "+" : ""}{change.value}%
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={`p-2 rounded-lg bg-${color}-100`}>
                        <Icon
                            icon={icon}
                            className={`text-${color}`}
                            width={24}
                            height={24}
                        />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default StatCard;