const Influx=require('influx');
async function MyDataLogger() {
const Math=require('math');
	const influx = new Influx.InfluxDB({
		host: 'localhost',
		database : 'iotmodule',
		schema: [
		{
			measurement: 'acceleration',
			fields: { x : Influx.FieldType.FLOAT, 
				y : Influx.FieldType.FLOAT,
				z : Influx.FieldType.FLOAT },
				tags : ['unit']
		}
		]
	});
var count=0.0;
while(1)
{	count = count+0.1;
	if (count > 6.28)
		count = 0;
	await influx.writePoints([
	{
		measurement : 'acceleration',
		tags : {
			unit: 'm/s^2',
		},
		fields : {	x : 9.81*Math.sin(count),
			y : count,
			z : 0
		}
	}
	], {
		database: 'microbit',
		precision: 'ms',
	}
	)
}
}
MyDataLogger();
