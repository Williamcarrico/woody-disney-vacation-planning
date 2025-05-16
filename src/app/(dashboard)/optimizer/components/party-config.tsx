"use client"

import { useState, useEffect } from "react"
import { UseFormReturn } from "react-hook-form"
import { MinusCircleIcon, PlusCircleIcon, Users2Icon } from "lucide-react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface PartyConfigSectionProps {
    form: UseFormReturn<any>
}

export default function PartyConfigSection({ form }: PartyConfigSectionProps) {
    const [showChildrenAges, setShowChildrenAges] = useState(false)

    // Update children ages when hasChildren changes
    useEffect(() => {
        const hasChildren = form.watch("hasChildren")
        setShowChildrenAges(hasChildren)

        if (!hasChildren) {
            form.setValue("childrenAges", [])
        }
    }, [form.watch("hasChildren")])

    const addChildAge = () => {
        const currentAges = form.getValues("childrenAges") || []
        form.setValue("childrenAges", [...currentAges, 8])
    }

    const removeChildAge = (index: number) => {
        const currentAges = form.getValues("childrenAges") || []
        form.setValue(
            "childrenAges",
            currentAges.filter((_, i) => i !== index)
        )
    }

    const updateChildAge = (index: number, value: string) => {
        const age = parseInt(value)
        if (isNaN(age) || age < 0 || age > 17) return

        const currentAges = form.getValues("childrenAges") || []
        const newAges = [...currentAges]
        newAges[index] = age
        form.setValue("childrenAges", newAges)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Party</CardTitle>
                <CardDescription>
                    Tell us about who's traveling with you for your Disney day.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <FormField
                    control={form.control}
                    name="partySize"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Party Size</FormLabel>
                            <div className="flex items-center space-x-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        if (field.value > 1) {
                                            field.onChange(field.value - 1)
                                        }
                                    }}
                                    disabled={field.value <= 1}
                                >
                                    <MinusCircleIcon className="h-4 w-4" />
                                </Button>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        min={1}
                                        max={20}
                                        className="w-20 text-center"
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value)
                                            if (!isNaN(value) && value >= 1 && value <= 20) {
                                                field.onChange(value)
                                            }
                                        }}
                                    />
                                </FormControl>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() => {
                                        if (field.value < 20) {
                                            field.onChange(field.value + 1)
                                        }
                                    }}
                                    disabled={field.value >= 20}
                                >
                                    <PlusCircleIcon className="h-4 w-4" />
                                </Button>
                                <Users2Icon className="h-4 w-4 text-muted-foreground ml-2" />
                                <span className="text-sm text-muted-foreground">
                                    {field.value} {field.value === 1 ? "person" : "people"}
                                </span>
                            </div>
                            <FormDescription>
                                The total number of people in your group.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Separator />

                <div className="space-y-4">
                    <FormField
                        control={form.control}
                        name="hasChildren"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Traveling with Children</FormLabel>
                                    <FormDescription>
                                        Are there any children under 18 in your party?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    {showChildrenAges && (
                        <div className="p-4 border rounded-lg space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium">Children's Ages</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addChildAge}
                                >
                                    <PlusCircleIcon className="h-4 w-4 mr-2" />
                                    Add Child
                                </Button>
                            </div>

                            {(form.watch("childrenAges")?.length || 0) === 0 ? (
                                <div className="text-sm text-muted-foreground italic">
                                    Add your children's ages to help customize your experience.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {form.watch("childrenAges")?.map((age: number, index: number) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <Badge variant="outline" className="px-2 py-1 text-xs">
                                                Child {index + 1}
                                            </Badge>
                                            <Input
                                                type="number"
                                                min={0}
                                                max={17}
                                                value={age}
                                                onChange={(e) => updateChildAge(index, e.target.value)}
                                                className="w-20"
                                                placeholder="Age"
                                            />
                                            <span className="text-sm text-muted-foreground">years old</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeChildAge(index)}
                                                className="h-8 w-8"
                                            >
                                                <MinusCircleIcon className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <FormDescription className="mt-2">
                                Ages help optimize for height requirements, appropriate attractions, and experience types.
                            </FormDescription>
                        </div>
                    )}
                </div>

                <Separator />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="hasStroller"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Using a Stroller</FormLabel>
                                    <FormDescription>
                                        Will you be using a stroller?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="mobilityConsiderations"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel>Mobility Considerations</FormLabel>
                                    <FormDescription>
                                        Does anyone have mobility needs?
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    )
}