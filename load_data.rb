require 'rubygems'
require 'mongo_mapper'

MongoMapper.database = 'apidb'

# class Location
#   include MongoMapper::Document
# 
#   # from csv:
#   # locId,country,region,city,postalCode,latitude,longitude,metroCode,areaCode
# 
#   key :location_id, Integer
#   key :country, String
#   key :region, String
#   key :city, String
#   key :zip, String
#   key :latitude, Float
#   key :longitude, Float
#   key :metro_code, Integer
#   key :area_code, Integer
# end
# 
# Location.collection.remove
# 
# File.open('./data/location.csv', 'r').each_with_index do |row, i| 
#   puts i if i % 1000 == 0
#   begin
#     ara = row.gsub('"', '').split(',')
#     Location.create(
#       :location_id => ara[0],
#       :country     => ara[1],
#       :region      => ara[2],
#       :city        => ara[3],
#       :zip         => ara[4],
#       :latitude    => ara[5],
#       :longitude   => ara[6],
#       :metro_code  => ara[7],
#       :area_code   => ara[8]
#     )
#   rescue 
#     puts "#{i} failed"
#   end
# end

#########

class Block
  include MongoMapper::Document

  # from csv:
  # startIpNum,endIpNum,locId

  key :start_ip_num, Integer
  key :end_ip_num, Integer
  key :location_id, Integer
end

Block.collection.remove

File.open('./data/blocks.csv', 'r').each_with_index do |row, i| 
  puts i if i % 1000 == 0
  begin
    ara = row.gsub('"', '').split(',')
    Block.create(
      :start_ip_num => ara[0],
      :end_ip_num	  => ara[1],
      :location_id  => ara[2]
    )
  rescue 
    puts "#{i} failed"
  end
end
